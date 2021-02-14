/* eslint-disable no-console */
import axios from 'axios';
import Moment from 'moment';
import Tibber from 'tibber-pulse-connector';
import firebase from './firebase';
import {
    updateInitStatus,
    updatePowerPrices,
    updatePowerUsage,
    updateRealtimeConsumption,
    updateTibberConsumptionMonth,
    updateTibberProductionMonth
} from './redux/actions';
import { AppDispatch } from './redux/store';
import {
    houses,
    TibberConsumptionNode,
    TibberConsumptionReturn,
    TibberProductionNode,
    TibberProductionReturn,
    TibberRealtimeData
} from './types/tibber';

const nettleie = 0.477;

interface TibberSettings {
  tibberApiKey: string;
  tibberHomeKey: string;
  tibberCabinKey: string;
}

export default class TibberUpdater {
  private store: { dispatch: AppDispatch };
  public constructor(store: { dispatch: AppDispatch }) {
    this.store = store;
  }

  public async updatePowerPrices(): Promise<void> {
    const settings: TibberSettings = await this.getTibberSettings();

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
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: {
          Authorization: `bearer ${settings.tibberApiKey}`,
        },
        data: {
          query: queryPrices,
        },
      });
      if (data.status === 200 && data.data.data.viewer.home.currentSubscription.priceInfo.today) {
        // Parse power prices
        const prices = data.data.data.viewer.home.currentSubscription.priceInfo.today;
        const powerPrices = {};
        prices.forEach((p: { startsAt: string; total: number }) => {
          const h = Moment(p.startsAt).hours();
          powerPrices[h] = { total: p.total + nettleie };
        });

        this.store.dispatch(updatePowerPrices(powerPrices));
        this.store.dispatch(updateInitStatus('powerPrices'));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  public async updateConsumption(): Promise<void> {
    const settings: TibberSettings = await this.getTibberSettings();
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
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: {
          Authorization: `bearer ${settings.tibberApiKey}`,
        },
        data: {
          query: queryUsage,
        },
      });
      if (data.status === 200) {
        const usage: TibberProductionNode[] = data.data.data.viewer.home.consumption.nodes;
        this.store.dispatch(updatePowerUsage(usage));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  public async subscribeToRealTime(): Promise<void> {
    const tibberSettings = await this.getTibberSettings();
    const token = tibberSettings.tibberApiKey;
    const homeId = [tibberSettings.tibberHomeKey, tibberSettings.tibberCabinKey];
    const connector = new Tibber({
      token,
      homeId,
      onData: (data: { data: { liveMeasurement: TibberRealtimeData } }, homeId: string) => {
        let where: houses;
        if (homeId === tibberSettings.tibberHomeKey) {
          where = 'hjemme';
        } else if (homeId === tibberSettings.tibberCabinKey) {
          where = 'hytta';
        } else {
          return;
        }
        // Here we have data, so we can proceed!
        const tmp = data.data.liveMeasurement;
        const out: TibberRealtimeData = {
          accumulatedConsumption: tmp.accumulatedConsumption,
          accumulatedCost: tmp.accumulatedCost,
          accumulatedProduction: tmp.accumulatedProduction,
          accumulatedReward: tmp.accumulatedReward,
          averagePower: tmp.averagePower,
          currency: tmp.currency,
          lastMeterConsumption: tmp.lastMeterConsumption,
          lastMeterProduction: tmp.lastMeterProduction,
          maxPower: tmp.maxPower,
          maxPowerProduction: tmp.maxPowerProduction,
          minPower: tmp.minPower,
          minPowerProduction: tmp.minPowerProduction,
          power: tmp.power,
          powerProduction: tmp.powerProduction,
          timestamp: tmp.timestamp,
        };
        this.store.dispatch(updateRealtimeConsumption(out, where));
      },
    });
    connector.start();
  }

  public async updateConsumptionDaily(): Promise<void> {
    const settings = await this.getTibberSettings();

    const daysToAskFor = new Date().getDate();
    const queryUsage = `
    {
      viewer {
        homes {
          id
          appNickname
          consumption(resolution: DAILY, last: ${daysToAskFor}) {
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
          production(resolution: DAILY, last: ${daysToAskFor}) {
            nodes {
              from
              to
              unitPrice
              unitPriceVAT
              production
              productionUnit
              profit
            }
          }
        }
      }
    }
`;

    try {
      const data = await axios({
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: {
          Authorization: `bearer ${settings.tibberApiKey}`,
        },
        data: {
          query: queryUsage,
        },
      });
      if (data.status === 200) {
        const outConsumption: TibberConsumptionNode[] = [];
        const outProduction: TibberProductionNode[] = [];
        const now = Moment();
        const usage = data.data.data.viewer.homes;
        usage.forEach(
          (u: {
            appNickname: string;
            id: string;
            consumption: TibberConsumptionReturn;
            production: TibberProductionReturn;
          }) => {
            u.consumption.nodes.forEach((n) => {
              const from = Moment(n.from);
              if (!from.isSame(now, 'month')) return;
              outConsumption.push(n);
            });
            u.production.nodes.forEach((n) => {
              const from = Moment(n.from);
              if (!from.isSame(now, 'month')) return;
              outProduction.push(n);
            });
          },
        );
        this.store.dispatch(updateTibberConsumptionMonth(outConsumption));
        this.store.dispatch(updateTibberProductionMonth(outProduction));
        // console.log(outConsumption, outProduction);
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Get tibber settings from firebase
  public async getTibberSettings(): Promise<TibberSettings> {
    const settingsRef = firebase.database().ref('settings');
    const snapshot = await settingsRef.once('value');
    const data = snapshot.val() as TibberSettings;
    return data;
  }
}
