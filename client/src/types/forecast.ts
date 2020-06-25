export interface WeatherDataSeries {
  [s: number]: HourForecast;
}

export interface ForecastStore {
  data: {
    [s: string]: {
      forecast: WeatherDataSeries;
      lat: number;
      lon: number;
    };
  };
  limits: WeatherLimits;
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
