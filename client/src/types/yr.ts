export interface Geometry {
  type: string;
  coordinates: number[];
}

export interface Units {
  air_pressure_at_sea_level: string;
  air_temperature: string;
  air_temperature_max: string;
  air_temperature_min: string;
  cloud_area_fraction: string;
  cloud_area_fraction_high: string;
  cloud_area_fraction_low: string;
  cloud_area_fraction_medium: string;
  dew_point_temperature: string;
  fog_area_fraction: string;
  precipitation_amount: string;
  precipitation_amount_max: string;
  precipitation_amount_min: string;
  probability_of_precipitation: string;
  probability_of_thunder: string;
  relative_humidity: string;
  ultraviolet_index_clear_sky: string;
  wind_from_direction: string;
  wind_speed: string;
  wind_speed_of_gust: string;
}

export interface Meta {
  updated_at: Date;
  units: Units;
}

export interface InstantForecast {
  air_pressure_at_sea_level: number;
  air_temperature: number;
  cloud_area_fraction: number;
  cloud_area_fraction_high: number;
  cloud_area_fraction_low: number;
  cloud_area_fraction_medium: number;
  dew_point_temperature: number;
  fog_area_fraction: number;
  relative_humidity: number;
  ultraviolet_index_clear_sky: number;
  wind_from_direction: number;
  wind_speed: number;
  wind_speed_of_gust: number;
}

export interface Instant {
  details: InstantForecast;
}

export interface Summary {
  symbol_code: string;
}

export interface TwelveHourForecast {
  probability_of_precipitation: number;
}

export interface Next12Hours {
  summary: Summary;
  details: TwelveHourForecast;
}

export interface NextHourForecast {
  precipitation_amount: number;
  precipitation_amount_max: number;
  precipitation_amount_min: number;
  probability_of_precipitation: number;
  probability_of_thunder: number;
}

export interface Next1Hours {
  summary: Summary;
  details: NextHourForecast;
}

export interface SixHourForecast {
  air_temperature_max: number;
  air_temperature_min: number;
  precipitation_amount: number;
  precipitation_amount_max: number;
  precipitation_amount_min: number;
  probability_of_precipitation: number;
}

export interface Next6Hours {
  summary: Summary;
  details: SixHourForecast;
}

export interface WeatherApiTimesetData {
  instant: Instant;
  next_12_hours?: Next12Hours;
  next_1_hours?: Next1Hours;
  next_6_hours?: Next6Hours;
}

export interface YrWeatherDataset {
  time: string;
  data: WeatherApiTimesetData;
}

export interface Properties {
  meta: Meta;
  timeseries: YrWeatherDataset[];
}

export interface YrResponse {
  type: string;
  geometry: Geometry;
  properties: Properties;
}
