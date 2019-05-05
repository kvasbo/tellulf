import Moment from 'moment';
import { UPDATE_WEATHER } from './actions';
import { parseLimits } from '../weather/updateWeather';
import { WeatherData } from '../types/weather';

interface state {
  weather: {} | undefined;
  long: {};
  limits: {} | undefined;
  lat: number | undefined;
  lon: number | undefined;
  todayMinMax: { min: number | null; max: number | null };
}

const initialState = {
  weather: undefined,
  long: {},
  limits: undefined,
  lat: undefined,
  lon: undefined,
  todayMinMax: { min: null, max: null },
};

export default function Weather(
  state: state = initialState,
  action: { type: string; data: any; lat: number; lon: number },
) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment()
        .add(3, 'day')
        .startOf('day');
      const toFilter = Object.values({ ...(state.weather as WeatherData), ...(action.data.weather as WeatherData) });
      const filtered = toFilter.filter((w: any) => {
        if (!w) return false;
        return Moment(w['time']).isBetween(from, to, undefined, '[]');
      });
      const newWeather: any = {};
      filtered.forEach((w: any) => {
        if (!w) return false;
        newWeather[w['time']] = w;
        return true;
      });
      return {
        ...state,
        lat: action.lat,
        lon: action.lon,
        weather: newWeather,
        long: { ...action.data.long },
        todayMinMax: action.data.todayMinMax,
        limits: parseLimits(action.data.weather, action.lat, action.lon),
      };
    }
    default:
      return state;
  }
}
