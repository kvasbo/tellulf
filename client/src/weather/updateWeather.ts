import axios from 'axios';
import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import omitBy from 'lodash/omitBy';
import {
  getSunMeta,
  initWeather,
  getTimeLimits,
  createKeyBasedOnStamps,
  storeToLocalStore,
} from './weatherHelpers';
import XML from 'pixl-xml';

import {
  WeatherData,
  WeatherDataSet,
  WeatherAPIData,
  WeatherAPIDataPeriod,
} from '../types/weather';

import { YrResponse, YrWeatherDataset } from '../types/yr';
import { WeatherDataSeries, HourForecast } from '../types/forecast';

export const localStorageKey = '12';
const longStorageKey = 'weatherLong';
const shortStorageKey = 'weatherShort';

interface ParseTimeReturn {
  f: Moment.Moment;
  t: Moment.Moment;
  from: number;
  to: number;
  diff: number;
  fromNice: string;
  time: number;
  key: string;
}

function parsePrecipitation(
  s: WeatherAPIDataPeriod,
): { rainMin: number | null; rainMax: number | null; rain: number | null } {
  let rain = null;
  let rainMax = null;
  let rainMin = null;
  if (s.location.precipitation) {
    rain = Number(s.location.precipitation.value);
    rainMax = rain;
    rainMin = rain;
    if (s.location.precipitation.maxvalue) {
      rainMax = Number(s.location.precipitation.maxvalue);
    }
    if (s.location.precipitation.minvalue) {
      rainMin = Number(s.location.precipitation.minvalue);
    }
  }
  return { rain, rainMin, rainMax };
}

function parseSymbol(s: WeatherAPIDataPeriod): { symbol: string; symbolNumber: number } {
  let symbol = 'blank';
  let symbolNumber = 0;
  if (s.location.symbol) {
    symbol = s.location.symbol.id;
    symbolNumber = Number(s.location.symbol.number);
  }
  return { symbol, symbolNumber };
}

function parseTemp(s: WeatherAPIDataPeriod): { temp: number | null } {
  let temp = null,
    minTemp = null,
    maxTemp = null;
  if (s.location.minTemperature && s.location.maxTemperature) {
    minTemp = Number(s.location.minTemperature.value);
    maxTemp = Number(s.location.maxTemperature.value);
    temp = (minTemp + maxTemp) / 2;
  }
  // If specific temp set, we overwrite!
  if (s.location.temperature) {
    temp = Number(s.location.temperature.value);
  }
  return { temp };
}

function parseTime(s: WeatherAPIDataPeriod, hoursToAddToKey = 0): ParseTimeReturn {
  const f = Moment(s.from);
  const t = Moment(s.to).add(hoursToAddToKey, 'hours');
  const from = f.valueOf();
  const to = t.valueOf();
  const diff = t.diff(f, 'hours');
  const fromNice = f.toISOString();
  const time = Moment(f)
    .add(Math.floor(diff / 2), 'hours')
    .valueOf();
  const key = createKeyBasedOnStamps(f.toISOString(), t.toISOString());
  return { f, t, from, to, diff, fromNice, time, key };
}

// New: Create a time stamp
function createTimeKey(d: Date): number {
  return Number(Moment(d).add(30, 'minutes').startOf('hour').format('x'));
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
    out.rain = d.data.next_6_hours.details.precipitation_amount;
    out.rainMin = d.data.next_6_hours.details.precipitation_amount_min;
    out.rainMax = d.data.next_6_hours.details.precipitation_amount_max;
    out.symbol = d.data.next_6_hours.summary.symbol_code;
  }

  return out;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function getWeatherFromYr(lat: number, long: number) {
  const { start, end } = getTimeLimits(14);
  const now = Moment();
  const sixesOut: WeatherDataSet = initWeather(6, 7, longStorageKey);
  const hoursOut: WeatherDataSet = initWeather(1, 3, shortStorageKey);

  // Use the new shiny API!
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat.toString()}&lon=${long.toString()}`;

  const nResponse = await axios.get(url);

  if (nResponse.statusText !== 'OK') {
    throw Error('Could not fetch Yr data');
  }

  // The new API data set
  const nData: YrResponse = nResponse.data;

  const nOut: WeatherDataSeries = {};
  nData.properties.timeseries.forEach((d) => {
    const key = createTimeKey(d.time);
    nOut[key] = parseWeatherHour(d);
  });

  // eslint-disable-next-line no-console
  console.log(nOut);

  // The old data set!
  const data = await axios.get(
    `https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat.toString()}&lon=${long.toString()}`,
  );
  const parsed = XML.parse(data.data);

  if (data.status !== 200 && data.status !== 203) {
    throw Error('Could not fetch Yr data');
  }

  // Six hour forecasts
  const sixes = parsed.product.time.filter((d: WeatherAPIData) => {
    const fromUtc = Moment(d.from).utc().hours();
    if (fromUtc % 6 !== 0) return false;
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (from.isBefore(start) || to.isAfter(end)) {
      return false;
    }
    if (to.diff(from, 'hours') === 6) return true;
    return false;
  });

  // One hour forecasts
  const hours = parsed.product.time.filter((d: WeatherAPIData) => {
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (from.isBefore(start) || to.isAfter(end)) {
      return false;
    }
    if (to.diff(from, 'hours') === 1) return true;
    return false;
  });

  // Single point forecasts
  const points = parsed.product.time.filter((d: WeatherAPIData) => {
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (from.isBefore(start) || to.isAfter(end)) {
      return false;
    }
    if (to.diff(from, 'hours') === 0) return true;
    return false;
  });

  // First, we do the long term forecast and put the data in the defined data set.
  sixes.forEach((s: WeatherAPIDataPeriod) => {
    const { from, to, fromNice, time, key } = parseTime(s);
    const { rain, rainMin, rainMax } = parsePrecipitation(s);
    const { symbol, symbolNumber } = parseSymbol(s);
    const { temp } = parseTemp(s);
    const out: WeatherData = {
      from,
      to,
      fromNice,
      time,
      temp,
      rain,
      rainMax,
      rainMin,
      symbol,
      symbolNumber,
    };
    sixesOut[key] = out;
  });

  // Get rain from hourly forecasts
  hours.forEach((s: WeatherAPIDataPeriod) => {
    const { key, from, to, fromNice, time } = parseTime(s);
    if (!hoursOut[key]) return;
    const { rain, rainMin, rainMax } = parsePrecipitation(s);
    const { symbol, symbolNumber } = parseSymbol(s);
    hoursOut[key] = {
      ...hoursOut[key],
      from,
      to,
      fromNice,
      time,
      rain,
      rainMax,
      rainMin,
      symbol,
      symbolNumber,
    };
  });

  // ...and the rest from points
  points.forEach((s: WeatherAPIDataPeriod) => {
    const { key, time } = parseTime(s, 1);
    if (!hoursOut[key]) return;

    const { temp } = parseTemp(s);
    hoursOut[key] = {
      ...hoursOut[key],
      time,
      temp,
    };
  });

  // Get today minmax
  const todayMinMax = { min: 999, max: -999 };
  Object.values(hoursOut).forEach((p) => {
    const d = p as WeatherData;
    if (!d) return;
    const time = Moment(d.time);
    if (!time.isSame(now, 'day')) return;
    if (d.temp && d.temp < todayMinMax.min) todayMinMax.min = d.temp;
    if (d.temp && d.temp > todayMinMax.max) todayMinMax.max = d.temp;
  });

  // Remove incomplete objects
  const filteredLong = omitBy(sixesOut, (val) => {
    const vals = Object.values(val);
    if (vals.indexOf(null) !== -1) {
      return true;
    }
    return false;
  });

  // Remove incomplete objects
  const filteredShort = omitBy(hoursOut, (val) => {
    const vals = Object.values(val);
    if (vals.indexOf(null) !== -1) {
      return true;
    }
    return false;
  });

  // Overwrite cache
  storeToLocalStore(`${longStorageKey}_'${localStorageKey}`, filteredLong, start, end);
  storeToLocalStore(`${shortStorageKey}_${localStorageKey}`, filteredShort, start, end);

  return { long: filteredLong, short: filteredShort, todayMinMax };
}

export function parseLimits(
  rawData: WeatherData[],
  lat = 59.9409,
  long = 10.6991,
  from?: Moment.Moment,
  to?: Moment.Moment,
): WeatherLimits {
  const sunData = getSunMeta(lat, long);

  let data = rawData;

  // Filter by time if needed
  if (from && to) {
    data = data.filter((d) => {
      return d.time >= from.valueOf() && d.time <= to.valueOf();
    });
  }

  // Init
  if (data.length === 0) {
    const data: WeatherLimits = {
      lowerRange: 0,
      upperRange: 30,
      maxRain: 0,
      maxRainTime: 0,
      maxTemp: 10,
      maxTempTime: 0,
      minTemp: 0,
      minTempTime: 0,
      ticks: [],
      ...sunData,
    };

    return data;
  }

  const maxRainPoint: WeatherData | undefined = maxBy(data, 'rainMax');
  const maxRain = maxRainPoint && maxRainPoint.rainMax ? maxRainPoint.rainMax : 0;
  const maxRainTime = maxRainPoint ? maxRainPoint.time : 0;
  const maxTempPoint: WeatherData | undefined = maxBy(data, 'temp');
  const maxTemp = maxTempPoint && maxTempPoint.temp ? maxTempPoint.temp : -999;
  const maxTempTime = maxTempPoint ? maxTempPoint.time : 0;
  const minTempPoint: WeatherData | undefined = minBy(data, 'temp');
  const minTemp = minTempPoint && minTempPoint.temp ? minTempPoint.temp : 999;
  const minTempTime = minTempPoint ? minTempPoint.time : 0;

  const roundedMin = Math.floor((minTemp - 2) / 10) * 10;
  const roundedMax = Math.ceil((maxTemp + 2) / 10) * 10;
  const lowerRange = minTemp > 0 ? 0 : Math.min(0, roundedMin);
  const upperRange = Math.max(lowerRange + 30, roundedMax);

  const ticks: number[] = [];
  for (let i = lowerRange; i <= upperRange; i += 10) {
    ticks.push(i);
  }

  const out: WeatherLimits = {
    lowerRange,
    upperRange,
    maxRain,
    maxRainTime,
    maxTemp,
    maxTempTime,
    minTemp,
    minTempTime,
    ticks,
    ...sunData,
  };

  return out;
}

interface WeatherLimits {
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
}
