import Moment from 'moment';
import { UPDATE_WEATHER, PRUNE_WEATHER, UPDATE_WEATHER_LONG } from './actions';

const initialState = {
  weather: undefined,
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
      return { ...state, weather: newWeather, limits: action.limits }
    }
    case UPDATE_WEATHER_LONG: {
      return { ...state, long: { ...state.long, ...action.data } }
    }
    case PRUNE_WEATHER: {
      break;
    }
    default:
      return state
  }
}