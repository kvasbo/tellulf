export interface WeatherStore {
  [s: string]: WeatherForAPlace;
}

export interface WeatherForAPlace {
  long: WeatherDataSet;
  limits: WeatherLimits;
  lat: number | undefined;
  lon: number | undefined;
  todayMinMax: { min: number; max: number };
}

export interface WeatherData {
  from: number;
  fromNice?: string;
  to: number;
  time: number;
  temp: number | null;
  rain: number | null;
  rainMin: number | null;
  rainMax: number | null;
  symbol: string;
  symbolNumber: number;
  sunHeight: number | null;
  minTemp: number | null;
  maxTemp: number | null;
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
  ticks: number[];
  sunrise: number;
  sunset: number;
  diffRise: number;
  diffSet: number;
}

export interface WeatherAPIData {
  from: string;
  to: string;
}

export interface WeatherAPIDataPeriod extends WeatherAPIData {
  location: {
    precipitation: {
      value: number;
      maxvalue: number;
      minvalue: number;
    };
    temperature: {
      value: number;
    };
    minTemperature: {
      value: number;
    };
    maxTemperature: {
      value: number;
    };
    symbol: {
      id: string;
      number: number;
    };
  };
}
