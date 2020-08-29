import { Action } from 'redux';

import { UPDATE_FORECAST } from './actions';
import { ForecastStore, WeatherLimits, Forecast } from '../types/forecast';
import { parseLimits } from '../weather/weatherHelpers';

const initalLimits: WeatherLimits = {
  maxRain: 0,
  maxTemp: 0,
  upperRange: 0,
  lowerRange: 0,
  minTemp: 0,
  ticks: [],
};

const initialState: ForecastStore = {
  data: {},
  limits: initalLimits,
};

interface KnownAction {
  type: string;
  data: Forecast;
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

      newState.data[action.sted] = action.data;

      // Calculate all the limits
      newState.limits = parseLimits(newState.data);

      return newState;
    }
    default:
      return state;
  }
}
