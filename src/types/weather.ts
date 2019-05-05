export interface WeatherStore {
  weather: WeatherDataSet;
  long: WeatherDataSet;
  lat: number;
  lon: number;
  limits: WeatherLimits;
  todayMinMax: WeatherTodayMinMax;
}

export interface WeatherData {
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

export interface WeatherTodayMinMax {
  min: number;
  max: number;
}

export interface WeatherDataSet {
  [s: number]: WeatherData;
}

export interface WeatherLimits {
  lowerRange: number;
  upperRange: number;
  maxRain: number;
  maxRainTime: number;
  maxTemp: number;
  maxTempTime: number;
  minTemp: number;
  minTempTime: number;
  ticks: [];
  sunrise: number;
  sunset: number;
  diffRise: number;
  diffSet: number;
}