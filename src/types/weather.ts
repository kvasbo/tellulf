export interface WeatherStore {
  weather: WeatherDataSet;
  long: WeatherDataSet;
  lat: number;
  lon: number;
  limits: WeatherLimits;
  todayMinMax: WeatherTodayMinMax;
}

export interface WeatherData {
  temp: number;
  rain: number;
  rainMin: number;
  rainMax: number;
  clouds: number;
  wind: number;
  symbol: string;
  sunHeight: number;
  time: number;
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

export interface WeatherAPIDataSinglePoint extends WeatherAPIData {
  location: {
    temperature: {
      value: number;
    };
    cloudiness: {
      percent: number;
    };
    windSpeed: {
      mps: number;
    };
  };
}
