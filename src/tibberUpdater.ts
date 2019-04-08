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

    const settings = await this.getTibberSettings();

    const queryPrices = `
    {
      viewer {
        home(id: "${settings.tibberHomeKey}") {
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

    const queryUsage = `
    {
      viewer {
        home(id: "${settings.tibberHomeKey}") {
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
        }
      }
    }
`;

    try {
      const data = await axios({
        url: "https://api.tibber.com/v1-beta/gql",
        method: "post",
        headers: {
          Authorization:
            `bearer ${settings.tibberApiKey}`
        },
        data: {
          query: queryPrices
        }
      });
      if (data.status === 200) {
        // Parse power prices
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

    try {
      const data = await axios({
        url: "https://api.tibber.com/v1-beta/gql",
        method: "post",
        headers: {
          Authorization:
            `bearer ${settings.tibberApiKey}`
        },
        data: {
          query: queryUsage
        }
      });
      if (data.status === 200) {
        const usage = data.data.data.viewer.home.consumption.nodes;
        this.store.dispatch(updatePowerUsage(usage));
      }
    } catch (err) {
      console.log(err);
    }

  }

  // Create and start websocket connection
  async subscribeToRealTime() {

    const settings:any = await this.getTibberSettings();
    const { tibberApiKey, tibberHomeKey } = settings;
    this.tibberSocket = new TibberConnector(tibberApiKey, tibberHomeKey, (data) => { this.store.dispatch(updateRealtimeConsumption(data)); });
    this.tibberSocket.start();

  }

  // Get tibber settings from firebase
  async getTibberSettings() {
    const settings:{ tibberApiKey:string, tibberHomeKey:string} = await new Promise((resolve, reject) => {
      const settingsRef = firebase.database().ref('settings');
      settingsRef.once('value', (snapshot: any) => {
        const settings = snapshot.val();
        resolve(settings);
      });
    });
    return settings;
  }

}