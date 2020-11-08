"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_timezone_1 = __importStar(require("moment-timezone"));
const lodash_1 = require("lodash");
const Steca = require('stecagridscrape');
class StecaParser {
    constructor(ip, firebase) {
        this.firebase = firebase;
        this.mySteca = new Steca(ip);
        this.samples = [];
        this.numberOfSamples = 0;
        console.log(`Steca parser initiated`);
    }
    async updateData(full = false) {
        const now = moment_timezone_1.tz(undefined, 'Europe/Oslo');
        const dst = now.isDST();
        const production = {};
        production.effect = { val: 0, time: null, error: false };
        production.today = { val: 0, time: null, error: false };
        try {
            production.effect.time = new Date().toUTCString();
            const effect = await this.mySteca.getEffect();
            production.effect.val = effect;
            this.checkMax(effect, now);
            const averages = this.addPowerSampleAndPrune(effect);
            production.averages = {
                time: new Date().toUTCString(),
                full: averages['60'],
                short: averages['15'],
                ...averages,
            };
        }
        catch (err) {
            production.effect.error = true;
            console.log(err.message);
        }
        try {
            production.today.time = new Date().toUTCString();
            const today = await this.mySteca.getProductionToday();
            production.today.val = today;
        }
        catch (err) {
            production.today.error = true;
            console.log(err.message);
        }
        const doFull = now.second() < 10 || full;
        if (doFull) {
            production.month = { val: 0, time: null, error: false };
            production.year = { val: 0, time: null, error: false };
            production.total = { val: 0, time: null, error: false };
            production.todayByHour = { val: [], time: null, error: false };
            try {
                production.month.time = new Date().toUTCString();
                const month = await this.mySteca.getProductionThisMonth();
                production.month.val = month;
            }
            catch (err) {
                production.month.error = true;
                console.log(err.message);
            }
            try {
                production.year.time = new Date().toUTCString();
                const year = await this.mySteca.getProductionThisYear();
                production.year.val = year;
            }
            catch (err) {
                production.year.error = true;
                console.log(err.message);
            }
            try {
                production.total.time = new Date().toUTCString();
                const total = await this.mySteca.getProductionTotal();
                production.total.val = total;
            }
            catch (err) {
                production.total.error = true;
                console.log(err.message);
            }
            try {
                if (production.todayByHour) {
                    production.todayByHour.time = new Date().toUTCString();
                    const byHour = await this.mySteca.getProductionTodayByHour();
                    production.todayByHour.val = [...byHour];
                }
            }
            catch (err) {
                production.total.error = true;
                console.log(err.message);
            }
        }
        const logString = `Solar Oslo ${new Date().toUTCString()} ${production.effect.val}W. Full: ${doFull}. DST: ${dst}`;
        console.log(logString);
        if (this.numberOfSamples % 100 === 0) {
            console.log(logString);
        }
        this.numberOfSamples += 1;
        try {
            this.firebase.database().ref('steca/currentData').update(production);
        }
        catch (err) {
            console.log(err.message);
        }
    }
    async checkMax(value, now) {
        const y = now.format('YYYY');
        const m = now.format('MM');
        const d = now.format('DD');
        const h = now.format('HH');
        const w = now.isoWeek();
        const refHour = `steca/maxValues/hourly/${y}/${m}/${d}/${h}`;
        const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
        const refMonth = `steca/maxValues/monthly/${y}/${m}`;
        const refYear = `steca/maxValues/yearly/${y}`;
        const refEver = `steca/maxValues/ever/`;
        const refMonthOfYear = `steca/maxValues/stat/month/${m}/`;
        const refWeekOfYear = `steca/maxValues/stat/week/${w}/`;
        const refHourOfDay = `steca/maxValues/stat/hour/${h}/`;
        const monthOfYearSnap = await this.firebase.database().ref(refMonthOfYear).once('value');
        const monthOfYearData = monthOfYearSnap.val();
        if (!monthOfYearData || value > monthOfYearData.value) {
            await this.firebase.database().ref(refMonthOfYear).set({ value, time: now.toISOString() });
            console.log(`Month of year max set, ${refMonthOfYear}, ${now.toISOString()}, ${value}`);
        }
        const weekOfYearSnap = await this.firebase.database().ref(refWeekOfYear).once('value');
        const weekOfYearData = weekOfYearSnap.val();
        if (!weekOfYearData || value > weekOfYearData.value) {
            await this.firebase.database().ref(refWeekOfYear).set({ value, time: now.toISOString() });
            console.log(`Week of year max set, ${refWeekOfYear}, ${now.toISOString()}, ${value}`);
        }
        const hourOfDaySnap = await this.firebase.database().ref(refHourOfDay).once('value');
        const hourOfDayData = hourOfDaySnap.val();
        if (!hourOfDayData || value > hourOfDayData.value) {
            await this.firebase.database().ref(refHourOfDay).set({ value, time: now.toISOString() });
            console.log(`Hour of day max set, ${refHourOfDay}, ${now.toISOString()}, ${value}`);
        }
        const hourSnap = await this.firebase.database().ref(refHour).once('value');
        const hourData = hourSnap.val();
        if (!hourData || value > hourData.value) {
            await this.firebase.database().ref(refHour).set({ value, time: now.toISOString() });
            console.log(`Hour max set, ${refHour}, ${now.toISOString()}, ${value}`);
        }
        else {
            return;
        }
        const daySnap = await this.firebase.database().ref(refDay).once('value');
        const dayData = daySnap.val();
        if (!dayData || value > dayData.value) {
            await this.firebase.database().ref(refDay).set({ value, time: now.toISOString() });
            console.log(`Daily max set, ${refDay}, ${now.toISOString()}, ${value}`);
        }
        else {
            return;
        }
        const monthSnap = await this.firebase.database().ref(refMonth).once('value');
        const monthData = monthSnap.val();
        if (!monthData || value > monthData.value) {
            await this.firebase.database().ref(refMonth).set({ value, time: now.toISOString() });
            console.log(`Monthly max set, ${refMonth}, ${now.toISOString()}, ${value}`);
        }
        else {
            return;
        }
        const yearSnap = await this.firebase.database().ref(refYear).once('value');
        const yearData = yearSnap.val();
        if (!yearData || value > yearData.value) {
            await this.firebase.database().ref(refYear).set({ value, time: now.toISOString() });
            console.log(`Year max set, ${refYear}, ${now.toISOString()}, ${value}`);
        }
        else {
            return;
        }
        const everSnap = await this.firebase.database().ref(refEver).once('value');
        const everData = everSnap.val();
        if (!everData || value > everData.value) {
            await this.firebase.database().ref(refEver).set({ value, time: now.toISOString() });
            console.log(`Ever max set, ${refEver}, ${now.toISOString()}, ${value}`);
        }
        console.log('Max ran all the way through. Expensive!');
    }
    getFilteredSamples(minutes) {
        const cut = moment_timezone_1.default().subtract(minutes, 'minutes');
        const tempSamples = this.samples.filter((s) => s.time.isSameOrAfter(cut));
        return tempSamples;
    }
    getAverageForPeriod(minutes) {
        const data = this.getFilteredSamples(minutes);
        const avg = Math.round(lodash_1.meanBy(data, 'value'));
        return avg;
    }
    addPowerSampleAndPrune(value) {
        this.samples.push({ value, time: moment_timezone_1.default() });
        const cutOff = moment_timezone_1.default().subtract(120, 'minutes');
        this.samples = this.samples.filter((s) => s.time.isSameOrAfter(cutOff));
        const averages = {};
        averages['1'] = this.getAverageForPeriod(1);
        averages['5'] = this.getAverageForPeriod(5);
        averages['10'] = this.getAverageForPeriod(10);
        averages['15'] = this.getAverageForPeriod(15);
        averages['30'] = this.getAverageForPeriod(30);
        averages['60'] = this.getAverageForPeriod(60);
        averages['90'] = this.getAverageForPeriod(90);
        averages['120'] = this.getAverageForPeriod(120);
        return averages;
    }
    start(interval) {
        this.updateData(true);
        setInterval(() => this.updateData(), interval);
    }
}
exports.default = StecaParser;
