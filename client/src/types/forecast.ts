export interface WeatherDataSeries {
  [s: number]: HourForecast;
}

export interface ForecastStore {
  [s: string]: {
    forecast: WeatherDataSeries;
    lat: number;
    lon: number;
  };
}

export interface HourForecast {
  time: number;
  temp?: number;
  rain?: number;
  rainMin?: number;
  rainMax?: number;
  symbol?: string;
}
