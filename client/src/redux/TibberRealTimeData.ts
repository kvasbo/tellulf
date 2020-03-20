import { UPDATE_TIBBER_REALTIME_CONSUMPTION } from './actions';
import Moment from 'moment';
import { Action } from 'redux';
import {
  TibberRealtimeState,
  TibberRealtimeData,
  TibberRealTimeDataState,
  houses,
} from '../types/tibber';

const nettTariff = {};
nettTariff['hjemme'] = 48.33;
nettTariff['hytta'] = 42.29;

const defaultStateValues: TibberRealtimeState = {
  accumulatedConsumption: 0,
  accumulatedCost: 0,
  accumulatedProduction: 0,
  accumulatedReward: 0,
  averagePower: 0,
  actualCost: 0,
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
  calculatedHomeAndCabinTotal: 0,
  previousMeasuredProduction: 0,
  lastHourByTenMinutes: {},
  avgLastHour: 0,
  avgLastHourSamples: 0,
  avgLastHourStamp: new Date().toISOString(),
};

const defaultState: TibberRealTimeDataState = {
  hytta: defaultStateValues,
  hjemme: defaultStateValues,
  totalNetUsage: 0,
};

interface KnownAction {
  type: string;
  where: houses;
  data: TibberRealtimeData;
}

function calculateActualCost(
  accumulatedConsumption: number,
  accumulatedCost: number,
  accumulatedProduction: number,
  accumulatedReward: number,
  sted: string,
): number {
  let cost = accumulatedCost - accumulatedReward; // Init with cost - reward.

  cost += accumulatedConsumption * nettTariff[sted]; // Add nettleie

  return cost;
}

export default function TibberRealTime(
  state: TibberRealTimeDataState = defaultState,
  incomingAction: Action,
) {
  const action = incomingAction as KnownAction;
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

      const actualCost = calculateActualCost(
        accumulatedConsumption,
        accumulatedCost,
        accumulatedProduction,
        accumulatedReward,
        action.where,
      );

      const avgLastHourStamp = stamp.format('dddHH');

      let avgLastHourSamples = state[action.where].avgLastHourSamples
        ? state[action.where].avgLastHourSamples + 1
        : 1;
      let avgLastHour = Math.round(
        state[action.where].avgLastHour +
          (power - state[action.where].avgLastHour) / avgLastHourSamples,
      );
      if (state[action.where].avgLastHourStamp !== avgLastHourStamp) {
        avgLastHour = Math.round(power);
        avgLastHourSamples = 1;
      }

      const lastHourByTenMinutes = state[action.where].lastHourByTenMinutes
        ? state[action.where].lastHourByTenMinutes
        : {};

      // Calculate realtime production
      let calculatedConsumption = power;
      let previousMeasuredProduction = state[action.where].previousMeasuredProduction;
      // We are producing!
      if (!calculatedConsumption) {
        if (powerProduction > 0) {
          previousMeasuredProduction = powerProduction; // Remember this!
        }
        calculatedConsumption = -1 * previousMeasuredProduction;
      }

      try {
        const lastHourByTenMinutes = state[action.where].lastHourByTenMinutes
          ? state[action.where].lastHourByTenMinutes
          : {};
        // calculate per minute
        const startOfMinute = Math.floor(stamp.minutes() / 10);
        const startTime = Moment(stamp)
          .minutes(startOfMinute * 10)
          .startOf('minute')
          .toISOString();

        if (lastHourByTenMinutes[startTime]) {
          // TODO make average!
        } else {
          lastHourByTenMinutes[startTime] = { startTime, usage: power, samples: 1 };
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }

      const newState = {
        ...state,
        [action.where]: {
          ...state[action.where],
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
          actualCost,
        },
      };
      newState.totalNetUsage =
        state.hjemme.calculatedConsumption + state.hytta.calculatedConsumption;

      return newState;
    }
    default:
      return state;
  }
}
