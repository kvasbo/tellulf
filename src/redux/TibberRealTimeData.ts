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
  lastHourByTenMinutes: {};
}

interface powerMinute {
  startTime: string,
  usage: number,
  samples: number,
}

export default function TibberRealTime(state = { power: 0, accumulatedConsumption: 0, accumulatedCost: 0, averagePower: 0, maxPower: 0, minPower: 0, avgLastHour: 0, avgLastHourSamples: 0, avgLastHourStamp: "heioghopp" , lastHourByTenMinutes: {}}, action: { type: string, data: realtimeData } ) {
  switch (action.type) {
    case UPDATE_TIBBER_REALTIME_CONSUMPTION: {
        const {
          power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower, timestamp
        } = action.data;
        // Calculate weighted average for hour
        const stamp = Moment(timestamp);
        const avgLastHourStamp = stamp.format("dddHH");
        let avgLastHourSamples = state.avgLastHourSamples + 1;
        let avgLastHour = Math.round(state.avgLastHour + ((power - state.avgLastHour) / avgLastHourSamples));
        if (state.avgLastHourStamp !== avgLastHourStamp) {
          avgLastHour = Math.round(power);
          avgLastHourSamples = 1;
        }

        const lastHourByTenMinutes = (state.lastHourByTenMinutes) ? state.lastHourByTenMinutes : {};
        
        try {
          const lastHourByTenMinutes = (state.lastHourByTenMinutes) ? state.lastHourByTenMinutes : {};
          // calculate per minute
          const startOfMinute = Math.floor(stamp.minutes() / 10);
          const startTime = Moment(stamp).minutes(startOfMinute * 10).startOf('minute').toISOString();
          // console.log(startTime);

          const toStore:powerMinute = { startTime, usage: 0, samples: 0 }

          if (lastHourByTenMinutes[startTime]) {
            // TODO make average!
          } else {
            lastHourByTenMinutes[startTime] = { startTime, usage: power, samples: 1 };
          }
        } catch(err) {
          console.log(err);
        }

        // TODO: Clean data by time. Store by minute.
        
        return { ...state, power, accumulatedConsumption, accumulatedCost, averagePower: Math.round(averagePower), maxPower, minPower, timestamp, avgLastHour, avgLastHourSamples, avgLastHourStamp, lastHourByTenMinutes };
    }
    default:
      return state;
  }
}
