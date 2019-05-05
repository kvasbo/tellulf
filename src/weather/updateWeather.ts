import axios from 'axios';
import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import {
  getSunMeta,
  initWeather,
  initWeatherLong,
  getTimeLimits,
  createKeyBasedOnStamps,
  storeToLocalStore,
} from './weatherHelpers';
import XML from 'pixl-xml';

import { WeatherData } from '../types/weather';

export const localStorageKey = '5';

export default async function getWeatherFromYr(lat: number, long: number) {
  const weatherOut = initWeather();
  const { start, end } = getTimeLimits(7);
  const now = Moment();

  const data = await axios.get(
    `https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat.toString()}&lon=${long.toString()}`,
  );
  const parsed = XML.parse(data.data);

  // Six hour forecasts
  const sixes = parsed.product.time.filter((d: { from: string; to: string }) => {
    const fromUtc = Moment(d.from)
      .utc()
      .hours();
    if (fromUtc % 6 !== 0) return false;
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (to.diff(from, 'hours') === 6) return true;
    return false;
  });

  const sixesOut = initWeatherLong();
  sixes.forEach((s: any) => {
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
    const out = {
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
    };
    sixesOut[key] = out;
  });

  const singlePoints = parsed.product.time.filter((d: any) => {
    if (d.from !== d.to) return false;
    const from = Moment(d.from);
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  singlePoints.forEach((p: { from: string; location: any }) => {
    const time = Moment(p.from);
    // Fake an hour!
    const to = Moment(p.from).add(1, 'hours');
    const key = createKeyBasedOnStamps(time.toISOString(), to.toISOString());
    if (key in weatherOut) {
      weatherOut[key].temp = p.location.temperature.value * 1;
      const clouds = (p.location.cloudiness.percent * 1) / 100;
      weatherOut[key].clouds = clouds;
      weatherOut[key].cloudsNeg = 1 - clouds;
      weatherOut[key].wind = Number(p.location.windSpeed.mps);
      weatherOut[key].time = time.valueOf();
    }
  });

  const hours = parsed.product.time.filter((d: any) => {
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (!(to.diff(from, 'hours') === 1)) return false;
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  hours.forEach((p: { from: string; to: string; location: any }) => {
    // console.log(p);
    const time = Moment(p.from);
    // const key = time.valueOf();
    const key = createKeyBasedOnStamps(p.from, p.to);
    if (key in weatherOut) {
      weatherOut[key].time = time.valueOf();
      weatherOut[key].rain = Number(p.location.precipitation.value);
      weatherOut[key].rainMin = Number(p.location.precipitation.minvalue);
      weatherOut[key].rainMax = Number(p.location.precipitation.maxvalue);
      weatherOut[key].symbol = p.location.symbol.id;
      weatherOut[key].symbolNumber = p.location.symbol.number;
    }
  });

  // Get today minmax
  const todayMinMax = { min: 999, max: -999 };
  Object.values(weatherOut).forEach(p => {
    const d = p as WeatherData;
    if (!d) return;
    const time = Moment(d.time);
    if (!time.isSame(now, 'day')) return;
    if (d.temp && d.temp < todayMinMax.min) todayMinMax.min = d.temp;
    if (d.temp && d.temp > todayMinMax.max) todayMinMax.max = d.temp;
  });

  // Overwrite cache
  storeToLocalStore(`weather_${localStorageKey}`, weatherOut, start, end);
  storeToLocalStore(`weatherLong_${localStorageKey}`, sixesOut, start, end);

  return { weather: weatherOut, long: sixesOut, todayMinMax };
}

export function parseLimits(data: {}, lat: number = 59.9409, long: number = 10.6991) {
  const dataArray = Object.values(data);
  const sunData = getSunMeta(lat, long);

  if (dataArray.length === 0) {
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
  const maxRainPoint: any = maxBy(dataArray, 'rainMax');
  const maxRain = maxRainPoint && maxRainPoint.rainMax ? maxRainPoint.rainMax : 0;
  const maxRainTime = maxRainPoint.time;
  const maxTempPoint: any = maxBy(dataArray, 'temp');
  const maxTemp = maxTempPoint.temp;
  const maxTempTime = maxTempPoint.time;
  const minTempPoint: any = minBy(dataArray, 'temp');
  const minTemp = minTempPoint.temp;
  const minTempTime = minTempPoint.time;
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
