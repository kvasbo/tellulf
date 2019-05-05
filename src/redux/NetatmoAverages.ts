import { NETATMO_UPDATE_AVERAGES } from './actions';

export interface NetatmoAverages {
  humidity: number;
  pressure: number;
  temperature: number;
  time: number;
}

const initState: NetatmoAverages = {
  humidity: 0,
  pressure: 0,
  temperature: 0,
  time: 0,
}

export default function NetatmoAverages(state = initState, action: { type: string, data: NetatmoAverages }) : NetatmoAverages {
  switch (action.type) {
    case NETATMO_UPDATE_AVERAGES: {
      console.log(action.data);
      try {
        let newState: NetatmoAverages = state;
        newState.humidity = action.data.humidity;
        newState.pressure = action.data.pressure;
        newState.temperature = action.data.temperature;
        newState.time = action.data.time;
        return { ...state, ...action.data };
      } catch (err) {
        console.log(err);
        return initState;
      }
    }
    default:
      return state;
  }
}
