import { UPDATE_SOLAR_CURRENT, UPDATE_SOLAR_MAX } from './actions';
import { SolarState } from '../types/solar';
import Moment from 'moment';

const initialState: SolarState = {
  max: {
    maxDay: 0,
    maxMonth: 0,
    maxYear: 0,
    maxEver: 0,
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

export default function Solar(state: SolarState = initialState, action: { type: string; data: object }): SolarState {
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
