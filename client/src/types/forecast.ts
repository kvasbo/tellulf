export interface NowcastStore {
  temp: number;
  rain: number;
  time: string;
}

export type ForecastPlace = 'oslo' | 'sandefjord';

export interface parsedWind {
  wind: number;
  gust: number;
  windName: string;
  gustName: string;
  direction: number;
}

export interface SixHourForecast {
  tempMax: number;
  tempMin: number;
  symbol: string;
  rain: number;
  rainMin: number;
  rainMax: number;
  rainProbability: number;
  prevTemp: number | undefined;
  nextTemp: number | undefined;
}
