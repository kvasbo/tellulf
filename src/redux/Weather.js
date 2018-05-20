import { cloneDeep } from 'lodash';
import Moment from 'moment';
import { UPDATE_WEATHER, PRUNE_WEATHER, UPDATE_WEATHER_LIMITS, UPDATE_WEATHER_LONG } from './actions';

const initialState = {
  weather: {},
  long: {},
  limits: undefined,
};

export function Weather(state = initialState, action) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment().add(2, 'day').startOf('day');
      const toFilter = Object.values({ ...state.weather, ...action.data });
      const filtered = toFilter.filter((w) => {
        return Moment(w.time).isBetween(from, to, null, "[]");
      });
      const newWeather = {};
      filtered.forEach((w) => {
        newWeather[w.time] = w;
      });
      return { ...state, weather: newWeather }
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