import axios from "axios";
import Moment from "moment";
import firebase from "./firebase";
import TibberConnector from 'tibber-pulse-connector';

import { updatePowerPrices, updateInitStatus, updateRealtimeConsumption, updatePowerUsage } from "./redux/actions";

const nettleie = 0.477;

export default class tibberUpdater {
  store: { dispatch: Function };
  tibberSocket: any;
  constructor(store: { dispatch: Function }) {
    this.store = store;
  }
  async updatePowerPrices() {
    try {
      const data = await axios({
        url: "https://api.tibber.com/v1-beta/gql",
        method: "post",
        headers: {
          Authorization:
            "bearer 272e9af8673aa8bcef149c9869e0697cdbfad92644893145887dc256829212d7"
        },
        data: {
          query: `
            {viewer {homes {currentSubscription {priceInfo {today {total energy tax startsAt }}}}}}
            `
        }
      });
      if (data.status === 200) {
        const prices =
          data.data.data.viewer.homes[0].currentSubscription.priceInfo.today;
        const powerPrices = {};
        prices.forEach(p => {
          const h = Moment(p.startsAt).hours();
          powerPrices[h] = { total: p.total + nettleie };
        });
        this.store.dispatch(updatePowerPrices(powerPrices));
        this.store.dispatch(updateInitStatus("powerPrices"));
      }
    } catch (err) {
      console.log(err);
    }
  }
  async subscribeToRealTime() {
    // Load (and init) settings
    const settingsRef = firebase.database().ref('settings');
    settingsRef.on('value', (snapshot: any) => {
      const settings = snapshot.val();
      console.log('Tibber settings initiated', settings);
      if (!settings || !settings.tibberApiKey || !settings.tibberHomeKey) {
        console.log('Tibber settings not found', settings);
        return;
      }
      const { tibberApiKey, tibberHomeKey } = settings;

      // Create tibber listener
      this.tibberSocket = new TibberConnector(tibberApiKey, tibberHomeKey, (data) => { this.store.dispatch(updateRealtimeConsumption(data)); });
      this.tibberSocket.start();
    });
  }
}
