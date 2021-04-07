/* eslint-disable no-console */
import axios from 'axios';
import Moment from 'moment';
import Tibber from 'tibber-pulse-connector';
import { TibberQuery, TibberFeed, IConfig } from 'tibber-api';
import { TibberSettings } from './App';
import {
  updateInitStatus,
  updatePowerPrices,
  updatePowerUsage,
  updateRealtimeConsumption,
} from './redux/actions';
import { AppDispatch } from './redux/store';
import { houses, TibberProductionNode, TibberRealtimeData } from './types/tibber';

const nettleie = 0.477;

export default class TibberUpdater {
  private store: { dispatch: AppDispatch };
  private settings;
  private query: TibberQuery;
  private feed: TibberFeed;

  public constructor(store: { dispatch: AppDispatch }, settings: TibberSettings) {
    this.store = store;
    this.settings = settings;

    const config: IConfig = {
      active: true,
      apiEndpoint: {
        apiKey: this.settings.tibberApiKey, // Demo token
        queryUrl: 'https://api.tibber.com/v1-beta/gql',
        feedUrl: 'wss://api.tibber.com/v1-beta/gql/subscriptions',
      },
    };

    // Instance of TibberQuery
    this.query = new TibberQuery(config);
    this.feed = new TibberFeed(config);
  }

  // TODO: PRICE PER HOUSE
  public async updatePowerPrices(): Promise<void> {
    const prices = await this.query.getTodaysEnergyPrices(this.settings.tibberHomeKey);
    const parsedPrices = {};
    prices.forEach((p: { startsAt: string; total: number }) => {
      const h = Moment(p.startsAt).hours();
      parsedPrices[h] = { total: p.total + nettleie };
    });

    this.store.dispatch(updatePowerPrices(parsedPrices));
    this.store.dispatch(updateInitStatus('powerPrices'));
  }

  public async updateConsumption(): Promise<void> {
    const settings: TibberSettings = this.settings;
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
          Authorization: `bearer ${this.settings.tibberApiKey}`,
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
    const token = this.settings.tibberApiKey;
    const homeId = [this.settings.tibberHomeKey, this.settings.tibberCabinKey];
    const connector = new Tibber({
      token,
      homeId,
      onData: (data: { data: { liveMeasurement: TibberRealtimeData } }, homeId: string) => {
        let where: houses;
        if (homeId === this.settings.tibberHomeKey) {
          where = 'hjemme';
        } else if (homeId === this.settings.tibberCabinKey) {
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
}
