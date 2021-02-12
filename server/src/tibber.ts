/* eslint-disable @typescript-eslint/no-var-requires */
const TibberConnector = require('tibber-pulse-connector');
const ws = require('ws');

let dataPointsReceived = 0;

class Tibber {
  apiKey: string;
  homeId: string[];
  firebase: firebase.app.App;

  constructor(apiKey: string, homeId: string[], firebase: firebase.app.App) {
    this.apiKey = apiKey;
    this.homeId = homeId;
    this.firebase = firebase;
  }

  start(): void {
    const options = {
      homeId: this.homeId,
      token: this.apiKey,
      onData: (data: Record<string, unknown>, id: string) => this.handleTibberRealTime(id, data),
      onError: (error: Error) => console.log(this.homeId + ' ' + error.message),
      ws,
    };
    const tibberConnectorHjemme = new TibberConnector(options);
    tibberConnectorHjemme.start();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleTibberRealTime(id: string, data: Record<string, any>): Promise<void> {
    const timeStamp = new Date().getTime();
    const toStore = { ...data.data.liveMeasurement, timeStamp };
    const ref = this.firebase.database().ref(`tibber/realtime/${id}`);
    if (true || dataPointsReceived % 100 === 0) {
      // eslint-disable-next-line no-console
      console.log(`Tibber data received (${dataPointsReceived}): ${toStore.power}W`);
    }
    dataPointsReceived += 1;
    await ref.set(toStore);
  }
}

export default Tibber;
