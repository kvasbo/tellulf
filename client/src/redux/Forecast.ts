import { Action } from 'redux';
import { UPDATE_FORECAST } from './actions';
import { WeatherDataSeries, ForecastStore } from '../types/forecast';

const initialState: ForecastStore = {};

interface KnownAction {
  type: string;
  data: {
    forecast: WeatherDataSeries;
  };
  lat: number;
  lon: number;
  sted: string;
}

export default function Weather(
  state: ForecastStore = initialState,
  incomingAction: Action,
): ForecastStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_FORECAST: {
      const newState: ForecastStore = { ...state };

      newState[action.sted] = {
        lat: action.lat,
        lon: action.lon,
        forecast: action.data,
      };
      return newState;
    }
    default:
      return state;
  }
}
