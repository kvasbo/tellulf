import axios from 'axios';
import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import omitBy from 'lodash/omitBy';
import {
  getSunMeta,
  initWeatherLong,
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

export const localStorageKey = '11';

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
  // console.log('parse rain', s.location.precipitation);
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

function parseTime(s: WeatherAPIDataPeriod): ParseTimeReturn {
  const f = Moment(s.from);
  const t = Moment(s.to);
  const from = f.valueOf();
  const to = t.valueOf();
  const diff = t.diff(f, 'hours');
  const fromNice = f.toISOString();
  const time = Moment(f)
    .add(diff / 2, 'hours')
    .valueOf();
  const key = createKeyBasedOnStamps(f.toISOString(), t.toISOString());
  return { f, t, from, to, diff, fromNice, time, key };
}

export default async function getWeatherFromYr(lat: number, long: number) {
  const { start, end } = getTimeLimits(14);
  const now = Moment();
  const sixesOut: WeatherDataSet = initWeatherLong();

  const data = await axios.get(
    `https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat.toString()}&lon=${long.toString()}`,
  );
  const parsed = XML.parse(data.data);

  if (data.status !== 200) throw Error('Could not fetch Yr data');

  // Six hour forecasts
  const sixes = parsed.product.time.filter((d: WeatherAPIData) => {
    const fromUtc = Moment(d.from)
      .utc()
      .hours();
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
      time: time.valueOf(),
      temp,
      rain,
      rainMax,
      rainMin,
      symbol,
      symbolNumber,
    };
    sixesOut[key] = out;
  });

  // TODO Merge!
  hours.forEach((s: WeatherAPIDataPeriod) => {
    const { key } = parseTime(s);
    if (!sixesOut[key]) return;
    const { rain, rainMin, rainMax } = parsePrecipitation(s);
    const { symbol, symbolNumber } = parseSymbol(s);
    const { temp } = parseTemp(s);
    if (rain) sixesOut[key].rain = rain;
    if (rainMin) sixesOut[key].rainMin = rainMin;
    if (rainMax) sixesOut[key].rainMax = rainMax;
    if (symbol) sixesOut[key].symbol = symbol;
    if (symbolNumber) sixesOut[key].symbolNumber = symbolNumber;
    if (temp) sixesOut[key].temp = temp;
  });

  // TODO Merge!
  points.forEach((s: WeatherAPIDataPeriod) => {
    const { key } = parseTime(s);
    if (!sixesOut[key]) return;
    const { rain, rainMin, rainMax } = parsePrecipitation(s);
    const { symbol, symbolNumber } = parseSymbol(s);
    const { temp } = parseTemp(s);
    if (rain) sixesOut[key].rain = rain;
    if (rainMin) sixesOut[key].rainMin = rainMin;
    if (rainMax) sixesOut[key].rainMax = rainMax;
    if (symbol) sixesOut[key].symbol = symbol;
    if (symbolNumber) sixesOut[key].symbolNumber = symbolNumber;
    if (temp) sixesOut[key].temp = temp;
  });

  /*
  console.log('p', points);
  console.log('h', hours);
  console.log('s0', sixesOut);
  */

  // Get today minmax
  const todayMinMax = { min: 999, max: -999 };
  Object.values(sixesOut).forEach(p => {
    const d = p as WeatherData;
    if (!d) return;
    const time = Moment(d.time);
    if (!time.isSame(now, 'day')) return;
    if (d.temp && d.temp < todayMinMax.min) todayMinMax.min = d.temp;
    if (d.temp && d.temp > todayMinMax.max) todayMinMax.max = d.temp;
  });

  // Remove incomplete objects
  const filteredData = omitBy(sixesOut, val => {
    const vals = Object.values(val);
    if (vals.indexOf(null) !== -1) {
      return true;
    }
    return false;
  });

  // Overwrite cache
  storeToLocalStore(`weatherLong_${localStorageKey}`, filteredData, start, end);

  return { long: filteredData, todayMinMax };
}

export function parseLimits(data: WeatherData[], lat: number = 59.9409, long: number = 10.6991) {
  const sunData = getSunMeta(lat, long);
  if (data.length === 0) {
    return {
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

  const out = {
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
