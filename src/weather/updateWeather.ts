import axios from 'axios';
import Moment from 'moment';
import store from 'store';
import XML from 'pixl-xml';

import { weatherData } from '../redux/Weather';

const localStorageKey = '1';

export default async function getWeatherFromYr(lat, long) {
  const weatherOut = initWeather();
  const { start, end } = getTimeLimits();
  const now = Moment();

  const data = await axios.get(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat}&lon=${long}`);
  const parsed = XML.parse(data.data);

  const singlePoints = parsed.product.time.filter((d) => {
    if (d.from !== d.to) return false;
    const from = Moment(d.from);
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  const hours = parsed.product.time.filter((d) => {
    const from = Moment(d.from);
    const to = Moment(d.to);
    if (!(to.diff(from, 'hours') === 1)) return false;
    if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
    return false;
  });

  const sixes = parsed.product.time.filter((d) => {
    const fromUtc = Moment(d.from).utc().hours();
    if (fromUtc % 6 !== 0) return false;
    const from = Moment(d.from);
    const to = Moment(d.to);
    if ((to.diff(from, 'hours') === 6)) return true;
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
  const sixesOut = {};
  sixes.forEach((s) => {
    const from = Moment(s.from);
    const key = from.valueOf();
    const to = Moment(s.to);
    const time = Moment(from).add(3, 'hours');
    const rain = Number(s.location.precipitation.value);
    const symbol = s.location.symbol.id;
    const minTemp = Number(s.location.minTemperature.value);
    const maxTemp = Number(s.location.maxTemperature.value);
    const temp = (minTemp + maxTemp) / 2;
    sixesOut[key] = {
      from: key, to: to.valueOf(), time: time.valueOf(), temp, minTemp, maxTemp, rain, symbol,
    };
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

  return { weather: weatherOut, long: sixesOut, todayMinMax };
}

function initWeather() {
  const out = {};
  const { start, end } = getTimeLimits();
  while (start.isSameOrBefore(end)) {
    const key = start.valueOf();
    out[key] = {
      temp: null, rain: null, rainMin: null, rainMax: null, clouds: null, wind: null, symbol: null, symbolNumber: null, sunHeight: null, time: start.valueOf(),
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

export function getTimeLimits() {
  const start = Moment().startOf('day');
  const end = Moment().add(3, 'day').startOf('day');
  return { start, end };
}
