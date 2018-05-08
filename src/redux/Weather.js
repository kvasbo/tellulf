import { cloneDeep } from 'lodash';
import { UPDATE_WEATHER, PRUNE_WEATHER, UPDATE_WEATHER_LIMITS  } from './actions';

const initialState = {
  weather: {},
  limits: undefined,
};

export function Weather(state = initialState, action) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const newWeather = cloneDeep(state);
      newWeather.weather = { ...newWeather.weather, ...action.data }
      return newWeather
    }
    case UPDATE_WEATHER_LIMITS: {
      const newLimits = cloneDeep(state);
      newLimits.limits = action.limits;
      return newLimits;
    }
    case PRUNE_WEATHER: {
      
    }
    default:
      return state
  }
}