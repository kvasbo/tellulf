export interface NowcastStore {
  temp: number;
  rain: number;
  time: string;
}

export type ForecastPlace = 'oslo' | 'sandefjord';

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
  symbol: string;
}
