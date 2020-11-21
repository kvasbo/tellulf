"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NetatmoApi = require('netatmo');
const moment_1 = __importDefault(require("moment"));
class Netatmo {
    constructor(config, firebase) {
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
    start(intervalInMinutes) {
        this.updateData();
        setInterval(() => this.updateData(), 60 * 1000 * intervalInMinutes);
    }
    init() {
        this.api.on('error', (error) => {
            console.log(error.message);
        });
        this.api.on('warning', (error) => {
            console.log(error.message);
        });
    }
    updateData() {
        try {
            const now = Math.round(new Date().getTime() / 1000);
            this.api.getPublicData({
                filter: true,
                lat_ne: 59.941747,
                lon_sw: 10.686413,
                lat_sw: 59.932211,
                lon_ne: 10.704957,
                required_data: 'temperature',
            }, (err, devices) => {
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
                devices.forEach((d) => {
                    for (const key in d.measures) {
                        const measure = d.measures[key];
                        if (!measure.res)
                            return;
                        const results = Object.values(measure.res)[0];
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
                console.log(log);
                this.firebase
                    .database()
                    .ref('netatmo/areaData')
                    .update({ time: now, temperature, humidity, pressure });
            });
            this.api.getStationsData((err, devices) => {
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
                this.firebase.database().ref('netatmo/currentData').set(this.currentData);
                const dateStamp = moment_1.default().startOf('hour').toDate();
                this.firebase.database().ref(`netatmo/history/${dateStamp}`).set(this.currentData);
                console.log(`${new Date().toISOString()}: Updated netatmo data. 'Ute' last seen ${lastSeenUte}`);
            });
        }
        catch (err) {
            console.log(err.message);
        }
    }
}
exports.default = Netatmo;
