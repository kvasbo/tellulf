import axios from "axios";
import Moment from "moment";
import firebase from "./firebase";
import TibberConnector from 'tibber-pulse-connector';

import { updatePowerPrices, updateInitStatus, updateRealtimeConsumption, updatePowerUsage } from "./redux/actions";

const nettleie = 0.477;

const query = `
{
  viewer {
    home(id: "2b05f8c5-3241-465d-92b8-9e7ad567f78f") {
      consumption(resolution: HOURLY, last: 24) {
        nodes {
          from
          to
          totalCost
          unitCost
          unitPrice
          unitPriceVAT
          consumption
          consumptionUnit
        }
      }
      currentSubscription {
        priceInfo {
          today {
            total
            energy
            tax
            startsAt
          }
        }
      }
    }
  }
}
`;

export default class tibberUpdater {
  store: { dispatch: Function };
  tibberSocket: any;
  constructor(store: { dispatch: Function }) {
    this.store = store;
  }

  async updatePowerPrices() {
    const settings:any = await new Promise((resolve, reject) => {
      const settingsRef = firebase.database().ref('settings');
      settingsRef.once('value', (snapshot: any) => {
        const settings = snapshot.val();
        resolve(settings);
      });
    });
    
    try {
      const data = await axios({
        url: "https://api.tibber.com/v1-beta/gql",
        method: "post",
        headers: {
          Authorization:
            `bearer ${settings.tibberApiKey}`
        },
        data: {
          query: query
        }
      });
      if (data.status === 200) {
        console.log('d', data.data.data.viewer.home);
        const prices =
          data.data.data.viewer.home.currentSubscription.priceInfo.today;
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

