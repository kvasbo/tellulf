import axios from 'axios';
import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import SunCalc from 'suncalc';
import store from 'store';
import XML from 'pixl-xml';

import { weatherData } from '../redux/Weather';

const localStorageKey = '1';

export default async function getWeatherFromYr(lat, long) {
  const weatherOut = initWeather();
  const weatherOutLong = initWeatherLong();
  const { start, end } = getTimeLimits(3);
  const now = Moment();

  const data = await axios.get(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat}&lon=${long}`);
  const parsed = XML.parse(data.data);

  const singlePoints = parsed.product.time.filter((d) => {
    if (d.from !== d.to) return false;
    const from = Moment(d.from);
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  singlePoints.forEach((p) => {
    const time = Moment(p.from);
    const key = time.valueOf();
    if (key in weatherOut) {
      weatherOut[key].temp = p.location.temperature.value * 1;
      const clouds =p.location.cloudiness.percent * 1 / 100;
      weatherOut[key].clouds = clouds;
      weatherOut[key].cloudsNeg = 1 - clouds;
      weatherOut[key].wind = Number(p.location.windSpeed.mps);
      weatherOut[key].time = time.valueOf();
    }
  });

  // Six hour forecasts
  const sixes = parsed.product.time.filter((d) => {
    const fromUtc = Moment(d.from).utc().hours();
    if (fromUtc % 6 !== 0) return false;
    const from = Moment(d.from);
    const to = Moment(d.to);
    if ((to.diff(from, 'hours') === 6)) return true;
    return false;
  });

  const sixesOut = initWeatherLong();
  sixes.forEach((s) => {
    const f = Moment(s.from);
    const t = Moment(s.to);
    const from = f.valueOf();
    const to = t.valueOf();
    const fromNice = f.toISOString();
    const diff = t.diff(f, 'hours');
    const time = f.add(diff / 2, 'hours');
    const key = time.toISOString();
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
      from, to, fromNice, time: time.valueOf(), temp, minTemp, maxTemp, rain, rainMax, rainMin, symbol, symbolNumber
    }
    sixesOut[key] = out;
  });

  const hours = parsed.product.time.filter((d) => {
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (!(to.diff(from, 'hours') === 1)) return false;
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  hours.forEach((p) => {
    const time = Moment(p.from);
    const key = time.valueOf();
    if (key in weatherOut) {
      weatherOut[key].rain = Number(p.location.precipitation.value);
      weatherOut[key].rainMin = Number(p.location.precipitation.minvalue);
      weatherOut[key].rainMax = Number(p.location.precipitation.maxvalue);
      weatherOut[key].symbol = p.location.symbol.id;
      weatherOut[key].symbolNumber = p.location.symbol.number;
    }
  });

  // Get today minmax
  const todayMinMax = { min: 999, max: -999 };
  Object.values(weatherOut).forEach((p) => {
    const d = p as weatherData;
    if (!d) return;
    const time = Moment(d.time);
    if (!time.isSame(now, 'day')) return;
    if (d.temp && d.temp < todayMinMax.min) todayMinMax.min = d.temp;
    if (d.temp && d.temp > todayMinMax.max) todayMinMax.max = d.temp;
  });

  // Overwrite cache
  store.set(`weather_${localStorageKey}`, weatherOut);
  store.set(`weatherLong_${localStorageKey}`, sixesOut);

  return { weather: weatherOut, long: sixesOut, todayMinMax };
}

// Init the six hours forecast
function initWeatherLong() {
  const spanToUseInHours = 6;
  const out = {};
  const time = Moment().utc().startOf('day');
  const spanEnd = Moment(time).add(8, 'day').startOf('day');
  while (time.isSameOrBefore(spanEnd)) {
    const startTime = Moment(time);
    const endTime = Moment(time).add(spanToUseInHours, 'hours');
    const diff = endTime.diff(startTime, 'hours');
    const midTime = startTime.add(diff / 2, 'hours');
    out[midTime.toISOString()] = {
      temp: null, rain: null, rainMin: null, rainMax: null, symbol: null, symbolNumber: null, time: midTime.valueOf(),
    } as weatherData;
    time.add(spanToUseInHours, 'hours');
  }

  // Load localstore if applicable, and write to output item if applicable
  const fromStore = store.get(`weatherLong_${localStorageKey}`);
  if (fromStore) {
    Object.keys(fromStore).forEach((k) => {
      if (out[k]) {
        out[k] = { ...out[k], ...fromStore[k] };
      }
    });
  }
  return out;
}

function initWeather() {
  const out = {};
  const { start, end } = getTimeLimits(3);
  while (start.isSameOrBefore(end)) {
    const time = start.valueOf();
    out[time] = {
      temp: null, rain: null, rainMin: null, rainMax: null, clouds: null, wind: null, symbol: null, symbolNumber: null, sunHeight: null, time,
    } as weatherData;
    start.add(1, 'hours');
  }

  // Load localstore if applicable, and write to output item if applicable
  const fromStore = store.get(`weather_${localStorageKey}`);
  if (fromStore) {
    Object.keys(fromStore).forEach((k) => {
      if (out[k]) {
        out[k] = { ...out[k], ...fromStore[k] };
      }
    });
  }
  return out;
}

export function getTimeLimits(days = 3) {
  const start = Moment().startOf('day');
  const end = Moment().add(days, 'day').startOf('day');
  return { start, end };
}

export function parseLimits(data: {}, lat: number = 59.9409, long: number = 10.6991) {
  const dataArray = Object.values(data);
  if (dataArray.length === 0) {
    return { lowerRange: 0, upperRange: 30, maxRain: 0, maxRainTime: 0, maxTemp: 10, maxTempTime: 0, minTemp: 0, minTempTime: 0 }
  }
  const maxRainPoint = maxBy(dataArray, 'rainMax');
  const maxRain = maxRainPoint.rainMax;
  const maxRainTime = maxRainPoint.time;
  const maxTempPoint = maxBy(dataArray, 'temp');
  const maxTemp = maxTempPoint.temp;
  const maxTempTime = maxTempPoint.time;
  const minTempPoint = minBy(dataArray, 'temp');
  const minTemp = minTempPoint.temp;
  const minTempTime = minTempPoint.time;
  const roundedMin = Math.floor((minTemp - 2) / 10) * 10;
  const roundedMax = Math.ceil((maxTemp + 2) / 10) * 10;
  const lowerRange = (minTemp > 0) ? 0 : Math.min(0, roundedMin);
  const upperRange = Math.max(lowerRange + 30, roundedMax);

  const ticks: number[] = [];
  for (let i = lowerRange; i <= upperRange; i += 10) {
    ticks.push(i);
  }

  const sunData = getSunMeta(lat, long);

  const out = {
    lowerRange, upperRange, maxRain, maxRainTime, maxTemp, maxTempTime, minTemp, minTempTime, ticks, ...sunData
  };

  return out;
}

function getSunMeta(lat: number, long: number, now = Moment()) {
  const yesterday = Moment(now).subtract(1, 'days');
  const sunTimes = SunCalc.getTimes(new Date(), lat, long);
  const sunTimesYesterday = SunCalc.getTimes(yesterday.toDate(), lat, long);
  const sunriseM = Moment(sunTimes.sunrise);
  const sunsetM = Moment(sunTimes.sunset);
  const sunriseYesterday = Moment(sunTimesYesterday.sunrise);
  const sunsetYesterday = Moment(sunTimesYesterday.sunset);
  const diffRise = sunriseM.diff(sunriseYesterday, 'minutes') - 1440;
  const diffSet = sunsetM.diff(sunsetYesterday, 'minutes') - 1440;
  const sunrise = sunriseM.valueOf();
  const sunset = sunsetM.valueOf();
  return {
    sunrise, sunset, diffRise, diffSet,
  };
}