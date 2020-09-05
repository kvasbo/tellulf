"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Init Firebase
// eslint-disable-next-line @typescript-eslint/no-var-requires
const NetatmoApi = require('netatmo');
const moment_1 = __importDefault(require("moment"));
class Netatmo {
    constructor(config, firebase, logger) {
        this.firebase = firebase;
        this.api = new NetatmoApi(config);
        this.logger = logger;
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
    start(intervalInMinutes) {
        this.updateData();
        setInterval(() => this.updateData(), 60 * 1000 * intervalInMinutes);
    }
    init() {
        this.api.on('error', (error) => {
            // When the "error" event is emitted, this is called
            this.logger.error(error.message);
        });
        this.api.on('warning', (error) => {
            // When the "warning" event is emitted, this is called
            this.logger.error(error.message);
        });
    }
    updateData() {
        try {
            const now = Math.round(new Date().getTime() / 1000);
            this.api.getPublicData({
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
            }, (err, devices) => {
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
                devices.forEach((d) => {
                    for (const key in d.measures) {
                        // Get the measure and results.
                        const measure = d.measures[key];
                        if (!measure.res)
                            return;
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
                this.logger.info(log);
                // eslint-disable-next-line no-console
                console.log(log);
                // Update current data
                this.firebase
                    .database()
                    .ref('netatmo/areaData')
                    .update({ time: now, temperature, humidity, pressure });
            });
            this.api.getStationsData((err, devices) => {
                if (err) {
                    this.logger.error(err.message);
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
                const dateStamp = moment_1.default().startOf('hour').toDate();
                // Update history
                this.firebase.database().ref(`netatmo/history/${dateStamp}`).set(this.currentData);
                this.logger.info(`${new Date().toISOString()}: Updated netatmo data. 'Ute' last seen ${lastSeenUte}`);
            });
        }
        catch (err) {
            this.logger.error(err.message);
        }
    }
}
exports.default = Netatmo;
