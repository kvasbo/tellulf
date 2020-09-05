/* eslint-disable @typescript-eslint/no-var-requires */
import { Timber } from '@timberio/node';
const TibberConnector = require('tibber-pulse-connector');
const ws = require('ws');

let dataPointsReceived = 0;

class Tibber {
  apiKey: string;
  homeId: string[];
  firebase: firebase.app.App;
  logger: Timber;

  constructor(apiKey: string, homeId: string[], firebase: firebase.app.App, logger: Timber) {
    this.apiKey = apiKey;
    this.homeId = homeId;
    this.firebase = firebase;
    this.logger = logger;
  }

  start(): void {
    const options = {
      homeId: this.homeId,
      token: this.apiKey,
      onData: (data: Record<string, unknown>, id: string) => this.handleTibberRealTime(id, data),
      onError: (error: Error) => this.logger.error(error.message),
      ws,
    };
    const tibberConnectorHjemme = new TibberConnector(options);
    tibberConnectorHjemme.start();
    this.logger.info('Tibber initalised and started.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleTibberRealTime(id: string, data: Record<string, any>): Promise<void> {
    const timeStamp = new Date().getTime();
    const toStore = { ...data.data.liveMeasurement, timeStamp };
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

export default Tibber;
