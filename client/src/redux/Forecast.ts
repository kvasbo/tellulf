import { Action } from 'redux';
import { UPDATE_FORECAST } from './actions';
import { WeatherDataSeries, ForecastStore } from '../types/forecast';

const initialState: ForecastStore = {
  data: {},
  limits: {
    maxRain: 0,
    maxTemp: 0,
    upperRange: 0,
    lowerRange: 0,
    minTemp: 0,
    ticks: [],
  },
};

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

      newState.data[action.sted] = {
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
