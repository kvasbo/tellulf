import Moment from 'moment';

export interface SolarHour {
  time: number;
  production: number;
}

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

export interface SolarMaxData {
  maxDay?: number;
  maxMonth?: number;
  maxYear?: number;
  maxEver?: number;
}

export interface SolarCurrent {
  averageFull: number;
  averageMinute: number;
  month: number;
  now: number;
  today: number;
  total: number;
  year: number;
  byHour: { time: number; production: number }[];
  currentTime: Moment.Moment;
  dataTime: Moment.Moment | null;
}
