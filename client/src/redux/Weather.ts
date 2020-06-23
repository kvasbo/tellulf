import Moment from 'moment';
import { Action } from 'redux';
import { UPDATE_WEATHER } from './actions';
import { WeatherData, WeatherTodayMinMax, WeatherDataSet, WeatherStore } from '../types/weather';
import { YrWeatherDataset } from '../types/yr';

const initialState: WeatherStore = {};

interface KnownAction {
  type: string;
  data: {
    long: WeatherData;
    todayMinMax: WeatherTodayMinMax;
    short: WeatherData;
    forecast: YrWeatherDataset;
  };
  lat: number;
  lon: number;
  sted: string;
}

export default function Weather(
  state: WeatherStore = initialState,
  incomingAction: Action,
): WeatherStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment().add(3, 'day').startOf('day');
      const existing = state[action.sted] ? state[action.sted] : {};
      const toFilter = Object.values({
        ...existing,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtered = toFilter.filter((w: any) => {
        if (!w) return false;
        return Moment(w['time']).isBetween(from, to, undefined, '[]');
      });
      const newWeather: WeatherDataSet = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filtered.forEach((w: any) => {
        if (!w) return false;
        newWeather[w['time']] = w;
        return true;
      });
      const newState: WeatherStore = { ...state };
      newState[action.sted] = {
        lat: action.lat,
        lon: action.lon,
        long: { ...action.data.long },
        short: { ...action.data.short },
        todayMinMax: action.data.todayMinMax,
      };
      return newState;
    }
    default:
      return state;
  }
}
