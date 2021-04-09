/* eslint-disable no-console */
import Moment from 'moment';
import Tibber from 'tibber-pulse-connector';
import { TibberQuery, TibberFeed, IConfig } from 'tibber-api';
import { TibberSettings } from './App';
import { updatePowerPrices, updateRealtimeConsumption } from './redux/actions';
import { AppDispatch } from './redux/store';
import { houses, TibberRealtimeData } from './types/tibber';

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
  }

  public async subscribeToRealTime(): Promise<void> {
    console.log('Starting Tibber subscribe');
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
