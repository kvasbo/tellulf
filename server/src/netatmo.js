// Init Firebase
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetatmoApi = require('netatmo');

function getHourStamp(d) {
  d.setMinutes(0);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}
class Netatmo {
  constructor(config, firebase, logger) {
    this.firebase = firebase;
    this.api = new NetatmoApi(config);
    this.logger = logger;
    this.init();
  }

  start(intervalInMinutes) {
    this.updateData();
    setInterval(() => this.updateData(), 60 * 1000 * intervalInMinutes);
  }

  init() {
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
    };

    this.api.on('error', error => {
      // When the "error" event is emitted, this is called
      this.logger.error(error.message);
    });

    this.api.on('warning', error => {
      // When the "warning" event is emitted, this is called
      this.logger.error(error.message);
    });
  }

  updateData() {
    try {
      const now = Math.round(new Date().getTime() / 1000);

      this.api.getPublicData(
        {
          filter: true,
          // eslint-disable-next-line @typescript-eslint/camelcase
          lat_ne: 59.941747,
          // eslint-disable-next-line @typescript-eslint/camelcase
          lon_sw: 10.686413,
          // eslint-disable-next-line @typescript-eslint/camelcase
          lat_sw: 59.932211,
          // eslint-disable-next-line @typescript-eslint/camelcase
          lon_ne: 10.704957,
          // eslint-disable-next-line @typescript-eslint/camelcase
          required_data: 'temperature',
        },
        (err, devices) => {
          if (err) {
            this.logger.error(err.message);
            return;
          }
          let tmpSamples = 0;
          let tmpTotal = 0;
          let pressSamples = 0;
          let pressTotal = 0;
          let humSamples = 0;
          let humTotal = 0;
          devices.forEach(d => {
            for (const key in d) {
              const t = d[key];
              for (const key in t) {
                const e = t[key];
                if (typeof e === 'object') {
                  if (e.res && e.type) {
                    const result = Object.values(e.res)[0];
                    const tempIndex = e.type.indexOf('temperature');
                    const pressIndex = e.type.indexOf('pressure');
                    const humIndex = e.type.indexOf('humidity');
                    if (tempIndex !== -1) {
                      const temp = Number(result[tempIndex]);
                      tmpTotal += temp;
                      tmpSamples += 1;
                    }
                    if (pressIndex !== -1) {
                      const press = Number(result[pressIndex]);
                      pressTotal += press;
                      pressSamples += 1;
                    }
                    if (humIndex !== -1) {
                      const hum = Number(result[humIndex]);
                      humTotal += hum;
                      humSamples += 1;
                    }
                  }
                }
              }
            }
          });
          const temperature = Math.round(tmpTotal / tmpSamples);
          const humidity = Math.round(humTotal / humSamples);
          const pressure = Math.round(pressTotal / pressSamples);

          this.logger.info(`Netatmo area averages: ${temperature}, ${pressure}, ${humidity}`);

          // Update current data
          this.firebase
            .database()
            .ref('netatmo/areaData')
            .update({ time: now, temperature, humidity, pressure });
        },
      );

      this.api.getStationsData((err, devices) => {
        if (err) {
          this.logger.error(err.message);
          return;
        }

        const d = devices[0];
        const m = d.modules;
        let lastSeenUte;

        if (now - d.dashboard_data.time_utc < 3600) {
          this.currentData.inneTemp = Number(d.dashboard_data.Temperature);
          this.currentData.inneFukt = Number(d.dashboard_data.Humidity);
          this.currentData.inneTrykk = Number(d.dashboard_data.Pressure);
          this.currentData.inneTrykkTrend = d.dashboard_data.pressure_trend;
          this.currentData.co2 = Number(d.dashboard_data.CO2);
        }

        for (let i = 0; i < m.length; i++) {
          if (now - m[i].last_seen < 3600) {
            if (m[i].module_name === 'Ute') {
              this.currentData.uteTemp = Number(m[i].dashboard_data.Temperature);
              this.currentData.uteFukt = Number(m[i].dashboard_data.Humidity);
              this.currentData.uteLastSeen = m[i].last_seen;
              lastSeenUte = new Date(Number(m[i].last_seen) * 1000).toISOString();
            } else if (m[i].module_name === 'Vinterhage') {
              this.currentData.vinterhageTemp = Number(m[i].dashboard_data.Temperature);
              this.currentData.vinterhageFukt = Number(m[i].dashboard_data.Humidity);
            }
          }
        }

        this.currentData.updated = new Date().getTime();
        this.currentData.updatedNice = new Date().toUTCString();

        // Update current data
        this.firebase
          .database()
          .ref('netatmo/currentData')
          .set(this.currentData);

        // Update history
        this.firebase
          .database()
          .ref(`netatmo/history/${getHourStamp(new Date())}`)
          .set(this.currentData);

        this.logger.info(
          `${new Date().toISOString()}: Updated netatmo data. 'Ute' last seen ${lastSeenUte}`,
        );
      });
    } catch (err) {
      this.logger.error(err.message);
    }
  }
}

export default Netatmo;
