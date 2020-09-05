"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TibberConnector = require('tibber-pulse-connector');
const ws = require('ws');
let dataPointsReceived = 0;
class Tibber {
    constructor(apiKey, homeId, firebase, logger) {
        this.apiKey = apiKey;
        this.homeId = homeId;
        this.firebase = firebase;
        this.logger = logger;
    }
    start() {
        const options = {
            homeId: this.homeId,
            token: this.apiKey,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onData: (data, id) => this.handleTibberRealTime(id, data),
            onError: (error) => this.logger.error(error.message),
            ws,
        };
        const tibberConnectorHjemme = new TibberConnector(options);
        tibberConnectorHjemme.start();
        this.logger.info('Tibber initalised and started.');
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handleTibberRealTime(id, data) {
        const timeStamp = new Date().getTime();
        const toStore = Object.assign({}, data.data.liveMeasurement, { timeStamp });
        this.logger.info(`Tibber ${id}: ${toStore.power}W`);
        const ref = this.firebase.database().ref(`tibber/realtime/${id}`);
        if (dataPointsReceived % 100 === 0) {
            // eslint-disable-next-line no-console
            console.log(`Tibber data received (${dataPointsReceived}): ${toStore.power}W`);
        }
        dataPointsReceived += 1;
        await ref.set(toStore);
    }
}
exports.default = Tibber;
