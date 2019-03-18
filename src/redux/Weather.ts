import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import SunCalc from 'suncalc';
import { UPDATE_WEATHER } from './actions';
import { parseLimits } from '../weather/updateWeather';

interface state {
  weather: {} | undefined,
  long: {},
  limits: {} | undefined,
  lat: number | undefined,
  lon: number | undefined,
  todayMinMax: { min: number | null, max: number | null },
}

export interface weatherData {
  temp: number | null,
  rain: number | null,
  rainMin: number | null,
  rainMax: number | null,
  clouds: number | null,
  wind: number | null,
  symbol: string | null,
  symbolNumber: number | null,
  sunHeight: number | null,
  time: string | number,
}

const initialState = {
  weather: undefined,
  long: {},
  limits: undefined,
  lat: undefined,
  lon: undefined,
  todayMinMax: { min: null, max: null },
};

export default function Weather(state: state = initialState, action: { type: string, data: any, lat: number, lon: number }) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment().add(3, 'day').startOf('day');
      const toFilter = Object.values({ ...state.weather as weatherData, ...action.data.weather as weatherData });
      const filtered = toFilter.filter((w) => {
        if (!w) return false;
        return Moment(w['time']).isBetween(from, to, undefined, '[]');
      });
      const newWeather = {};
      filtered.forEach((w) => {
        if (!w) return false;
        newWeather[w['time']] = w;
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