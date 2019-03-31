import { UPDATE_TIBBER_REALTIME_CONSUMPTION } from './actions';
import Moment from 'moment';

interface realtimeData {
  power: number;
  accumulatedCost: number,
  accumulatedConsumption: number;
  averagePower: number;
  maxPower: number;
  minPower: number;
  timestamp: string;
}

export default function TibberRealTime(state = { power: 0, accumulatedConsumption: 0, accumulatedCost: 0, averagePower: 0, maxPower: 0, minPower: 0, avgLastHour: 0, avgLastHourSamples: 0, avgLastHourStamp: "heioghopp" }, action: { type: string, data: realtimeData } ) {
  switch (action.type) {
    case UPDATE_TIBBER_REALTIME_CONSUMPTION: {
        const {
          power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower, timestamp
        } = action.data;
        // Calculate weighted average
        const avgLastHourStamp = Moment(timestamp).format("dddHH");
        console.log(avgLastHourStamp);
        let avgLastHourSamples = state.avgLastHourSamples + 1;
        let avgLastHour = Math.round(state.avgLastHour + ((power - state.avgLastHour) / avgLastHourSamples));
        if (state.avgLastHourStamp !== avgLastHourStamp) {
          avgLastHour = Math.round(power);
          avgLastHourSamples = 1;
        }
        
        return { ...state, power, accumulatedConsumption, accumulatedCost, averagePower: Math.round(averagePower), maxPower, minPower, timestamp, avgLastHour, avgLastHourSamples, avgLastHourStamp };
    }
    default:
      return state;
  }
}
