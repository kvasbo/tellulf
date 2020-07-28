import axios from 'axios';
import Moment from 'moment';
import store from 'store';
import { getTimeLimits, storeToLocalStore } from './weatherHelpers';

import { YrResponse, YrWeatherDataset } from '../types/yr';
import { WeatherDataSeries, HourForecast, Forecast } from '../types/forecast';

export const localStorageKey = '12';
const weatherSeriesKey = 'weatherSeries';

// New: Create a time stamp
function createTimeKey(d: Date): number {
  return Moment(d).add(30, 'minutes').startOf('hour').valueOf();
}

// New: Parse a data set
function parseWeatherHour(d: YrWeatherDataset): HourForecast {
  const out: HourForecast = { time: createTimeKey(d.time) };
  out.temp = d.data.instant.details.air_temperature;

  // Use hourly data
  if (d.data.next_1_hours) {
    out.rain = d.data.next_1_hours.details.precipitation_amount;
    out.rainMin = d.data.next_1_hours.details.precipitation_amount_min;
    out.rainMax = d.data.next_1_hours.details.precipitation_amount_max;
    out.symbol = d.data.next_1_hours.summary.symbol_code;
  } else if (d.data.next_6_hours) {
    //... or six hours
    out.rain = d.data.next_6_hours.details.precipitation_amount / 6;
    out.rainMin = d.data.next_6_hours.details.precipitation_amount_min / 6;
    out.rainMax = d.data.next_6_hours.details.precipitation_amount_max / 6;
    out.symbol = d.data.next_6_hours.summary.symbol_code;
  }
  return out;
}

// New
function initWeatherSeries(days = 14): WeatherDataSeries {
  const nOut: WeatherDataSeries = {};

  const start = Moment().startOf('day').valueOf();
  const diff = 1000 * 60 * 60; // an hour
  const hours = days * 24;

  for (let i = 0; i < hours; i++) {
    const time = start + diff * i;
    nOut[time] = { time };
  }

  // Get from storage
  const fromStore: WeatherDataSeries = store.get(`${weatherSeriesKey}_${localStorageKey}`);

  // Get data from stored set if time is in initialised set.
  if (fromStore) {
    Object.values(nOut).forEach((k) => {
      if (fromStore[k.time]) {
        nOut[k.time] = fromStore[k.time];
      }
    });
  }

  return nOut;
}

export async function getForecastFromYr(lat: number, lon: number): Promise<Forecast> {
  // Use the new shiny API!
  const { start, end } = getTimeLimits(14);
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat.toString()}&lon=${lon.toString()}`;
  const nResponse = await axios.get(url);
  if (nResponse.statusText !== 'OK') {
    throw Error('Could not fetch Yr data');
  }
  // The new API data set
  const nData: YrResponse = nResponse.data;

  const forecast: Forecast = {
    forecast: initWeatherSeries(),
    lat,
    lon,
    updated: Moment(0),
  };

  nData.properties.timeseries.forEach((d) => {
    const key = createTimeKey(d.time);
    // Check if not null
    forecast.forecast[key] = parseWeatherHour(d);
  });

  storeToLocalStore(`${weatherSeriesKey}_${localStorageKey}`, forecast.forecast, start, end);
  return forecast;
}
