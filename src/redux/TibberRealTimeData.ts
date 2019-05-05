import { UPDATE_TIBBER_REALTIME_CONSUMPTION } from './actions';
import Moment from 'moment';

interface RealtimeData {
  accumulatedConsumption?: number;
  accumulatedCost?: number;
  accumulatedProduction?: number;
  accumulatedReward?: number;
  averagePower: number;
  currency?: string;
  lastMeterConsumption?: number;
  lastMeterProduction?: number;
  maxPower?: number;
  maxPowerProduction?: number;
  minPower?: number;
  minPowerProduction?: number;
  power: number;
  powerProduction: number;
  timestamp?: string;
  calculatedConsumption: number;
  previousMeasuredProduction: number;
}

interface State extends RealtimeData {
  lastHourByTenMinutes?: {};
  avgLastHour: number;
  avgLastHourSamples?: number;
  avgLastHourStamp?: string;
}

const defaultState: State = {
  accumulatedConsumption: 0,
  accumulatedCost: 0,
  accumulatedProduction: 0,
  accumulatedReward: 0,
  averagePower: 0,
  currency: 'NOK',
  lastMeterConsumption: 0,
  lastMeterProduction: 0,
  maxPower: 0,
  maxPowerProduction: 0,
  minPower: 0,
  minPowerProduction: 0,
  power: 0,
  powerProduction: 0,
  timestamp: new Date().toISOString(),
  calculatedConsumption: 0,
  previousMeasuredProduction: 0,
  lastHourByTenMinutes: {},
  avgLastHour: 0,
  avgLastHourSamples: 0,
  avgLastHourStamp: new Date().toISOString(),
};

interface PowerMinute {
  startTime: string;
  usage: number;
  samples: number;
}

export default function TibberRealTime(state: State = defaultState, action: { type: string; data: RealtimeData }) {
  switch (action.type) {
    case UPDATE_TIBBER_REALTIME_CONSUMPTION: {
      const {
        accumulatedConsumption,
        accumulatedCost,
        accumulatedProduction,
        accumulatedReward,
        averagePower,
        currency,
        lastMeterConsumption,
        lastMeterProduction,
        maxPower,
        maxPowerProduction,
        minPower,
        minPowerProduction,
        power,
        powerProduction,
        timestamp,
      } = action.data;

      // Calculate weighted average for hour
      const stamp = Moment(timestamp);

      const avgLastHourStamp = stamp.format('dddHH');

      let avgLastHourSamples = state.avgLastHourSamples ? state.avgLastHourSamples + 1 : 1;
      let avgLastHour = Math.round(state.avgLastHour + (power - state.avgLastHour) / avgLastHourSamples);
      if (state.avgLastHourStamp !== avgLastHourStamp) {
        avgLastHour = Math.round(power);
        avgLastHourSamples = 1;
      }

      const lastHourByTenMinutes = state.lastHourByTenMinutes ? state.lastHourByTenMinutes : {};

      // Calculate realtime production
      let calculatedConsumption = power;
      let previousMeasuredProduction = state.previousMeasuredProduction;
      // We are producing!
      if (!calculatedConsumption || calculatedConsumption === 0) {
        if (powerProduction > 0) {
          previousMeasuredProduction = powerProduction; // Remember this!
        }
        calculatedConsumption = -1 * previousMeasuredProduction;
      }

      try {
        const lastHourByTenMinutes = state.lastHourByTenMinutes ? state.lastHourByTenMinutes : {};
        // calculate per minute
        const startOfMinute = Math.floor(stamp.minutes() / 10);
        const startTime = Moment(stamp)
          .minutes(startOfMinute * 10)
          .startOf('minute')
          .toISOString();
        // console.log(startTime);

        // const toStore: PowerMinute = { startTime, usage: 0, samples: 0 };

        if (lastHourByTenMinutes[startTime]) {
          // TODO make average!
        } else {
          lastHourByTenMinutes[startTime] = { startTime, usage: power, samples: 1 };
        }
      } catch (err) {
        console.log(err);
      }

      // TODO: Clean data by time. Store by minute.

      return {
        ...state,
        accumulatedConsumption,
        accumulatedCost,
        accumulatedProduction,
        accumulatedReward,
        averagePower,
        currency,
        lastMeterConsumption,
        lastMeterProduction,
        maxPower,
        maxPowerProduction,
        minPower,
        minPowerProduction,
        power,
        powerProduction,
        timestamp,
        avgLastHour,
        avgLastHourSamples,
        avgLastHourStamp,
        lastHourByTenMinutes,
        calculatedConsumption,
        previousMeasuredProduction,
      };
    }
    default:
      return state;
  }
}
