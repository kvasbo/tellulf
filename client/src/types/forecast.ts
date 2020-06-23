export interface WeatherDataSeries {
  [s: number]: HourForecast;
}

export interface HourForecast {
  time: number;
  temp?: number;
  rain?: number;
  rainMin?: number;
  rainMax?: number;
  symbol?: string;
}
