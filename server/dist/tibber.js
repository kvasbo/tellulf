"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TibberConnector = require('tibber-pulse-connector');
const ws = require('ws');
let dataPointsReceived = 0;
class Tibber {
    constructor(apiKey, homeId, firebase) {
        this.apiKey = apiKey;
        this.homeId = homeId;
        this.firebase = firebase;
    }
    start() {
        const options = {
            homeId: this.homeId,
            token: this.apiKey,
            onData: (data, id) => this.handleTibberRealTime(id, data),
            onError: (error) => console.log(this.homeId + ' ' + error.message),
            ws,
        };
        const tibberConnectorHjemme = new TibberConnector(options);
        tibberConnectorHjemme.start();
    }
    async handleTibberRealTime(id, data) {
        const timeStamp = new Date().getTime();
        const toStore = { ...data.data.liveMeasurement, timeStamp };
        const ref = this.firebase.database().ref(`tibber/realtime/${id}`);
        if (true || dataPointsReceived % 100 === 0) {
            console.log(`Tibber data received (${dataPointsReceived}): ${toStore.power}W`);
        }
        dataPointsReceived += 1;
        await ref.set(toStore);
    }
}
exports.default = Tibber;
