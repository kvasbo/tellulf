// Init Firebase
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetatmoApi = require('netatmo');

import Moment from 'moment';

export interface NetatmoConfig {
  username: string;
  password: string;
  client_id: string;
  client_secret: string;
}

interface CurrentData {
  inneTemp: number | null;
  uteTemp: number | null;
  c02: number | null;
  uteFukt: number | null;
  inneFukt: number | null;
  vinterhageFukt: number | null;
  vinterhageTemp: number | null;
  updated: number | null;
  updatedNice: string | null;
  inneTrykk: number | null;
  inneTrykkTrend: string | number | null;
  co2: number | null;
  uteLastSeen?: number;
}

// A Netatmo device result
interface Device {
  place: {
    altitude?: number;
    city?: string;
    country?: string;
    timezone?: string;
    location?: number[];
  };
  measures: {
    [s: string]: DeviceMeasure;
  };
}

interface ForeignDevice extends Device {
  modules: string[];
}

interface MyDevice extends Device {
  modules: MyModule[];
  dashboard_data: {
    pressure_trend: string;
    temp_trend: string;
    Temperature: number;
    time_utc: number;
    CO2: number;
    Humidity: number;
    Noise: number;
    Pressure: number;
    AbsolutePressure: number;
    min_temp: number;
    max_temp: number;
    date_max_temp: number;
    date_min_temp: number;
  };
}

interface MyModule {
  type: string;
  last_seen: number;
  module_name: string;
  reachable: boolean;
  last_message: number;
  battery_percent: number;
  data_type: string[];
  last_setup: number;
  firmware: number;
  rf_status: number;
  battery_vp: number;
}

// A single set of measurements from Netatmo API
interface DeviceMeasure {
  res?: {
    [s: string]: number[];
  };
  type: string[];
}
class Netatmo {
  private firebase: firebase.app.App;
  private currentData: CurrentData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private api: any;
  constructor(config: NetatmoConfig, firebase: firebase.app.App) {
    this.firebase = firebase;
    this.api = new NetatmoApi(config);
    this.currentData = {
      inneTemp: null,
      uteTemp: null,
      c02: null,
      uteFukt: null,
      inneFukt: null,
      vinterhageFukt: null,
      vinterhageTemp: null,
      updated: null,
      updatedNice: null,
      inneTrykk: null,
      inneTrykkTrend: null,
      co2: null,
    };
    this.init();
  }

  start(intervalInMinutes: number): void {
    this.updateData();
    setInterval(() => this.updateData(), 60 * 1000 * intervalInMinutes);
  }

  init(): void {
    this.api.on('error', (error: Error) => {
      // When the "error" event is emitted, this is called
      console.log(error.message);
    });

    this.api.on('warning', (error: Error) => {
      // When the "warning" event is emitted, this is called
      console.log(error.message);
    });
  }

  updateData(): void {
    try {
      const now = Math.round(new Date().getTime() / 1000);

      this.api.getPublicData(
        {
          filter: true,
          lat_ne: 59.941747,
          lon_sw: 10.686413,
          lat_sw: 59.932211,
          lon_ne: 10.704957,
          required_data: 'temperature',
        },
        (err: Error, devices: ForeignDevice[]) => {
          if (err) {
            console.log(err.message);
            return;
          }
          let tmpSamples = 0;
          let tmpTotal = 0;
          let pressSamples = 0;
          let pressTotal = 0;
          let humSamples = 0;
          let humTotal = 0;
          devices.forEach((d: ForeignDevice) => {
            for (const key in d.measures) {
              // Get the measure and results.
              const measure = d.measures[key];
              if (!measure.res) return;

              const results = Object.values(measure.res)[0];

              // Get index and then value of temperature, pressure, hum
              const tempIndex = measure.type.indexOf('temperature');
              if (tempIndex !== -1 && results[tempIndex]) {
                const temp = results[tempIndex];
                tmpTotal += temp;
                tmpSamples += 1;
              }

              const pressIndex = measure.type.indexOf('pressure');
              if (pressIndex !== -1 && results[pressIndex]) {
                const press = results[pressIndex];
                pressTotal += press;
                pressSamples += 1;
              }
              const humIndex = measure.type.indexOf('humidity');
              if (humIndex !== -1 && results[humIndex]) {
                const hum = results[humIndex];
                humTotal += hum;
                humSamples += 1;
              }
            }
          });

          const temperature = Math.round(tmpTotal / Math.max(1, tmpSamples));
          const humidity = Math.round(humTotal / Math.max(1, humSamples));
          const pressure = Math.round(pressTotal / Math.max(1, pressSamples));

          const log = `Netatmo area averages: ${temperature} deg, ${pressure} bar, ${humidity} percent`;

          // eslint-disable-next-line no-console
          console.log(log);

          // Update current data
          this.firebase
            .database()
            .ref('netatmo/areaData')
            .update({ time: now, temperature, humidity, pressure });
        },
      );

      this.api.getStationsData((err: Error, devices: MyDevice[]) => {
        if (err) {
          console.log(err.message);
          return;
        }

        const d = devices[0];
        let lastSeenUte;

        if (now - d.dashboard_data.time_utc < 3600) {
          this.currentData.inneTemp = Number(d.dashboard_data.Temperature);
          this.currentData.inneFukt = Number(d.dashboard_data.Humidity);
          this.currentData.inneTrykk = Number(d.dashboard_data.Pressure);
          this.currentData.inneTrykkTrend = d.dashboard_data.pressure_trend;
          this.currentData.co2 = Number(d.dashboard_data.CO2);
        }

        this.currentData.updated = new Date().getTime();
        this.currentData.updatedNice = new Date().toUTCString();

        // Update current data
        this.firebase.database().ref('netatmo/currentData').set(this.currentData);

        const dateStamp = Moment().startOf('hour').toDate();

        // Update history
        this.firebase.database().ref(`netatmo/history/${dateStamp}`).set(this.currentData);

        console.log(
          `${new Date().toISOString()}: Updated netatmo data. 'Ute' last seen ${lastSeenUte}`,
        );
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}

export default Netatmo;
