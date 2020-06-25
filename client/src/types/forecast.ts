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

export interface WeatherLimits {
  lowerRange: number;
  upperRange: number;
  maxRain: number;
  maxTemp: number;
  minTemp: number;
  ticks: number[];
}
