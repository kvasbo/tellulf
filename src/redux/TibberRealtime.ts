import { UPDATE_TIBBER_REALTIME_CONSUMPTION } from './actions';

interface realtimeData {
  power: number;
  accumulatedCost: number,
  accumulatedConsumption: number;
  averagePower: number;
  maxPower: number;
  minPower: number;
  timestamp: String;
}

export default function TibberRealTime(state = { power: 0, accumulatedConsumption: 0, accumulatedCost: 0, averagePower: 0, maxPower: 0, minPower: 0 }, action: { type: string, data: realtimeData } ) {
  switch (action.type) {
    case UPDATE_TIBBER_REALTIME_CONSUMPTION: {
        const {
          power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower,
        } = action.data;
        // console.log('raw data', action.data);
        return { ...state, power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower };
    }
    default:
      return state;
  }
}
