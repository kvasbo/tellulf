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

export const localStorageKey = '10';

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
    if (to.diff(from, 'hours') === 6) return true;
    return false;
  });

  sixes.forEach((s: WeatherAPIDataPeriod) => {
    const f = Moment(s.from);
    const t = Moment(s.to);

    // Kill!
    if (f.isBefore(start) || t.isAfter(end)) {
      return;
    }

    const from = f.valueOf();
    const to = t.valueOf();
    const fromNice = f.toISOString();
    const diff = t.diff(f, 'hours');
    const time = Moment(f).add(diff / 2, 'hours');
    const key = createKeyBasedOnStamps(f.toISOString(), t.toISOString());
    const rain = Number(s.location.precipitation.value);
    let rainMax = rain;
    let rainMin = rain;
    if (s.location.precipitation.maxvalue) {
      rainMax = Number(s.location.precipitation.maxvalue);
    }
    if (s.location.precipitation.minvalue) {
      rainMin = Number(s.location.precipitation.minvalue);
    }
    const symbol = s.location.symbol.id;
    const symbolNumber = Number(s.location.symbol.number);
    const minTemp = Number(s.location.minTemperature.value);
    const maxTemp = Number(s.location.maxTemperature.value);
    const temp = Math.round((minTemp + maxTemp) / 2);
    const out: WeatherData = {
      from,
      to,
      fromNice,
      time: time.valueOf(),
      temp,
      minTemp,
      maxTemp,
      rain,
      rainMax,
      rainMin,
      symbol,
      symbolNumber,
      sunHeight: 0,
    };
    sixesOut[key] = out;
  });

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
    if (vals.indexOf(null) !== -1) return true;
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
