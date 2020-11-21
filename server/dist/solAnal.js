"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Axios = require('axios');
const Moment = require('moment-timezone');
Moment.tz.setDefault('Europe/Oslo');
const iftttUrlKey = process.env.IFTTT_KEY;
const minutesBetweenChanges = 0;
const minutesBetweenRuns = 5;
const defaultThresholds = {
    upwards: 850,
    downwards: 750,
    moment: 1500,
};
const initState = (name, urlCodeOpen, urlCodeClose, startTimeThresholdInMinutesOfDay = 0) => {
    return {
        name,
        urlCodeOpen,
        urlCodeClose,
        desiredState: 'start',
        lastChange: 'start',
        lastChangeTime: Moment(),
        timeThreshold: startTimeThresholdInMinutesOfDay,
    };
};
class SolAnal {
    constructor(firebase) {
        this.currentEffect = 0;
        this.currentAverage = 0;
        this.firebase = firebase;
        this.dbRef = firebase.database().ref('steca/currentData');
        this.settingsRef = firebase.database().ref('steca/thresholds');
        this.states = {
            tak: initState('takvindu', 'roof_open', 'roof_close', 420),
            stue: initState('stue', 'suntrigger_open', 'suntrigger_close', 660),
        };
        this.thresholds = defaultThresholds;
        setInterval(() => this.doCheck(), minutesBetweenRuns * 60000);
        setTimeout(() => this.doCheck(), 5000);
        console.log('SolAnal created, thresholds:', this.thresholds);
        this.settingsListener = this.settingsRef.on('value', (snapshot) => {
            try {
                const data = snapshot.val();
                if (data && data.upwards) {
                    this.thresholds.upwards = data.upwards;
                }
                else {
                }
                if (data && data.downwards) {
                    this.thresholds.downwards = data.downwards;
                }
                else {
                    console.log('downwards threshold not set');
                }
                if (data && data.moment) {
                    this.thresholds.moment = data.moment;
                }
                else {
                    console.log('moment threshold not set');
                }
                console.log('Thresholds loaded', this.thresholds);
            }
            catch (err) {
                console.log(err);
            }
        });
        this.sunListener = this.dbRef.on('value', (snapshot) => {
            try {
                const data = snapshot.val();
                const baseData = {
                    now: data.averages['1'],
                    nowAveraged: data.averages['30'],
                };
                this.currentAverage = baseData.nowAveraged;
                this.currentEffect = baseData.now;
                console.log('SolAnal: New solar data received: ', baseData.nowAveraged);
                this.checkIfWeShouldDoAnything(baseData);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    doCheck() {
        const now = Moment();
        Object.keys(this.states).forEach((key) => {
            const timeSinceLastChange = now.diff(this.states[key].lastChangeTime, 'minutes');
            const timeToStartDoingStuffForThisOne = Moment()
                .startOf('day')
                .add(this.states[key].timeThreshold, 'minutes');
            if (timeSinceLastChange < minutesBetweenChanges) {
                console.log(`${now.format('LT')} ${key}: Deferring due to recent change or startup.`);
                return;
            }
            if (this.states[key].desiredState === 'start') {
                console.log(`${key}: Waiting, not yet analyzed!`);
                return;
            }
            if (timeToStartDoingStuffForThisOne.isAfter(now)) {
                console.log(`${now.format('LT')} ${key}: Waiting, too early in the day, will start at ${timeToStartDoingStuffForThisOne.format('LT')}`);
                return;
            }
            if (this.states[key].desiredState !== this.states[key].lastChange) {
                this.doTheThing(key, this.states[key].desiredState);
            }
        });
    }
    async doTheThing(key, instruction) {
        try {
            console.log(`Performing instruction: ${key} ${instruction}`);
            this.states[key].lastChange = instruction;
            this.states[key].lastChangeTime = Moment();
            let url;
            let iftttKey;
            if (instruction === 'open') {
                iftttKey = this.states[key].urlCodeOpen;
            }
            else if (instruction === 'closed') {
                iftttKey = this.states[key].urlCodeClose;
            }
            else {
                console.log(`${key} ${instruction} Bad instruction, or no change detected`);
                return;
            }
            url = `https://maker.ifttt.com/trigger/${iftttKey}/with/key/${iftttUrlKey}`;
            const result = await Axios.get(url);
            console.log(`Performed instruction: ${key} ${instruction}, ${result.statusText}`);
        }
        catch (err) {
            console.log(`Error performing instruction  ${key} ${instruction}`, err);
        }
    }
    checkIfWeShouldDoAnything(analysis) {
        let closeMoment = false;
        if (analysis.now > this.thresholds.moment) {
            closeMoment = true;
        }
        let closeAveraged = false;
        if (analysis.nowAveraged > this.thresholds.upwards) {
            closeAveraged = true;
        }
        let openAveraged = false;
        if (analysis.nowAveraged < this.thresholds.downwards) {
            openAveraged = true;
        }
        const close = closeAveraged || closeMoment;
        const open = openAveraged;
        let desiredState;
        if (close) {
            desiredState = 'closed';
        }
        else {
            desiredState = 'open';
        }
        Object.keys(this.states).forEach((key) => {
            this.states[key].desiredState = desiredState;
        });
    }
}
exports.default = SolAnal;
