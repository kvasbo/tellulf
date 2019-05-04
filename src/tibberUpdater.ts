import axios from "axios";
import Moment from "moment";
import firebase from "./firebase";
import TibberConnector from "tibber-pulse-connector";
import { updatePowerPrices, updateInitStatus, updateRealtimeConsumption, updatePowerUsage } from "./redux/actions";
import { string, number } from "prop-types";

const nettleie = 0.477;

const netPriceSettings = {
  Hjemme: {
    fast: 100,
    kwh: 0.4795,
    kwpProd: 0.07,
  },
  Hytta: {
    fast: 287.50,
    kwh: 0.41913,
    kwhProd: 0.07,
  }
}

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
        prices.forEach((p: { startsAt: string, total: number }) => {
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

  async updateConsumption() {
    const settings = await this.getTibberSettings();
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
    this.tibberSocket = new TibberConnector(tibberApiKey, tibberHomeKey, (data: any ) => {
      if(!data.error) {
        this.store.dispatch(updateRealtimeConsumption(data)); 
      } else {
        throw new Error(data.error);
      }
    });
    this.tibberSocket.start();

  }

  async updateConsumptionMonthlyAndCalculateBills() {
    const settings = await this.getTibberSettings();
    const queryUsage = `
    {
      viewer {
        homes {
          id
          appNickname
          consumption(resolution: MONTHLY, last: 3) {
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
          query: queryUsage
        }
      });
      if (data.status === 200) {
        const usage = data.data.data.viewer.homes;
        usage.forEach((u: { appNickname: string, consumption: { nodes: [] }}) => {
          console.group(u.appNickname);
          console.info("OBS: Mangler produksjonsdata!")
          u.consumption.nodes.forEach((n: { from: string, to: string, totalCost: number, consumption: number }) => {
            const from = Moment(n.from).format("MMMM");
            const tibberPrice = n.totalCost; //.toFixed(2).toLocaleString();
            const netPrice = (n.consumption * netPriceSettings[u.appNickname].kwh + netPriceSettings[u.appNickname].fast); //.toFixed(2).toLocaleString();
            const totalPrice = tibberPrice + netPrice;
            console.group(`${from}: `);
            console.log(`Strøm: ${tibberPrice.toFixed(2).toLocaleString()}`);
            console.log(`Nett: ${netPrice.toFixed(2).toLocaleString()}`);
            console.log(`Totalt: ${totalPrice.toFixed(2).toLocaleString()}`);

            console.groupEnd();
          });
          // console.log(u);
          console.groupEnd();
        });
      }
    } catch (err) {
      console.log(err);
    }

  }

  // Get tibber settings from firebase
  async getTibberSettings() {
    const settings:{ tibberApiKey:string, tibberHomeKey:string, tibberCabinKey:string } = await new Promise((resolve, reject) => {
      const settingsRef = firebase.database().ref('settings');
      settingsRef.once('value', (snapshot: any) => {
        const settings = snapshot.val();
        resolve(settings);
      });
    });
    return settings;
  }

}