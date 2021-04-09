import Moment from 'moment';

export interface NowcastStore {
  temp: number;
  time: string;
}

export interface WeatherDataSeries {
  [timestamp: number]: HourForecast;
}

export interface HourForecast {
  time: number;
  durationInHours: number;
  temp?: number;
  rain?: number;
  rainMin?: number;
  rainMax?: number;
  symbol?: string;
}
