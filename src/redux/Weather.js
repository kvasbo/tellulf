import { cloneDeep } from 'lodash';
import { UPDATE_WEATHER, PRUNE_WEATHER, UPDATE_WEATHER_LIMITS, UPDATE_WEATHER_LONG } from './actions';

const initialState = {
  weather: {},
  long: {},
  limits: undefined,
};

export function Weather(state = initialState, action) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const newWeather = cloneDeep(state);
      newWeather.weather = { ...newWeather.weather, ...action.data }
      return newWeather
    }
    case UPDATE_WEATHER_LONG: {
      const newWeather = cloneDeep(state);
      newWeather.long = { ...newWeather.long, ...action.data }
      return newWeather
    }
    case UPDATE_WEATHER_LIMITS: {
      const newLimits = cloneDeep(state);
      newLimits.limits = action.limits;
      return newLimits;
    }
    case PRUNE_WEATHER: {
      break;
    }
    default:
      return state
  }
}