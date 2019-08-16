import { NETATMO_UPDATE_AVERAGES } from './actions';
import { Action } from 'redux';
export interface NetatmoAverageData {
  humidity: number;
  pressure: number;
  temperature: number;
  time: number;
}

const initState: NetatmoAverageData = {
  humidity: 0,
  pressure: 0,
  temperature: 0,
  time: 0,
};

interface KnownAction {
  type: string;
  data: NetatmoAverageData;
}

export default function NetatmoAverages(
  state = initState,
  incomingAction: Action,
): NetatmoAverageData {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case NETATMO_UPDATE_AVERAGES: {
      try {
        const newState: NetatmoAverageData = state;
        newState.humidity = action.data.humidity;
        newState.pressure = action.data.pressure;
        newState.temperature = action.data.temperature;
        newState.time = action.data.time;
        return { ...state, ...action.data };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return initState;
      }
    }
    default:
      return state;
  }
}
