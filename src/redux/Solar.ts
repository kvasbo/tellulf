import { UPDATE_SOLAR_CURRENT, UPDATE_SOLAR_MAX } from './actions';
import Moment from 'moment';

const initialState: SolarState = {
  max: {
    maxDay: 0,
    maxMonth: 0,
    maxYear: 0,
    maxEver: 0
  }, 
  current: {
    averageFull: 0,
    averageMinute: 0,
    month: 0,
    now: 0,
    today: 0,
    total: 0,
    year: 0,
    byHour: [],
    currentTime: Moment(),
    dataTime: null,
  },
};

export interface SolarState {
  max: SolarMax;
  current: SolarCurrent;
}

export interface SolarMax {
  maxDay: number;
  maxMonth: number;
  maxYear: number;
  maxEver: number;
}

export interface SolarCurrent {
  averageFull: number;
  averageMinute: number;
  month: number;
  now: number;
  today: number;
  total: number;
  year: number;
  byHour: {time: number, production: number}[]
  currentTime: Moment.Moment;
  dataTime: Moment.Moment | null;
}

export default function Solar(state: SolarState = initialState, action: { type: string, data: object }) : SolarState {
  switch (action.type) {
    case UPDATE_SOLAR_MAX: {
      return { ...state, max: { ...state.max, ...action.data } };
    }
    case UPDATE_SOLAR_CURRENT: {
      return { ...state, current: { ...state.current, ...action.data } };
    }
    default:
      return state;
  }
}
