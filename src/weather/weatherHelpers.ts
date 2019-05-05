import Moment from 'moment';
import SunCalc from 'suncalc';
import store from 'store';
import { getNorwegianDaysOff } from '../external';
import { WeatherData } from '../types/weather';
import { localStorageKey } from './updateWeather';

const sundayColor = '#FF0000CC';
const redDays = getNorwegianDaysOff();
const gridColor = '#FFFFFFAA';

export function getTimeLimits(days = 3) {
  const start = Moment().startOf('day');
  const end = Moment()
    .add(days, 'day')
    .startOf('day');
  return { start, end };
}

export function getTicks() {
  const { start, end } = getTimeLimits(7);
  const out = [];
  while (start.isSameOrBefore(end)) {
    if (start.hours() % 6 === 0) {
      out.push(start.valueOf());
    }
    start.add(1, 'hours');
  }
  return out;
}

export function getDayColor(time: any) {
  const d = Moment(time);
  if (d.day() === 0 || d.day() === 6) return sundayColor;
  const dString = d.format('MMDD');
  if (redDays.includes(dString)) return sundayColor;
  return gridColor;
}

export function formatTick(data: any) {
  const time = Moment(data, 'x');
  return time.format('HH');
}

export function getSunMeta(lat: number, long: number, now = Moment()) {
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
    sunrise,
    sunset,
    diffRise,
    diffSet,
  };
}

export function createKeyBasedOnStamps(from: string, to: string) {
  const f = Moment(from);
  const t = Moment(to);
  const key = `${f.toISOString()}->${t.toISOString()}`;
  return key;
}

export function initWeather() {
  const out = {};
  const { start, end } = getTimeLimits(3);
  while (start.isSameOrBefore(end)) {
    const time = start.valueOf();
    const from = Moment(start);
    const to = Moment(from).add(1, 'hours');
    const key = createKeyBasedOnStamps(from.toISOString(), to.toISOString());
    const d: WeatherData = {
      temp: null,
      rain: null,
      rainMin: null,
      rainMax: null,
      clouds: null,
      wind: null,
      symbol: null,
      symbolNumber: null,
      sunHeight: null,
      time,
    };
    out[key] = d;
    start.add(1, 'hours');
  }

  // Load localstore if applicable, and write to output item if applicable
  const fromStore = store.get(`weather_${localStorageKey}`);
  if (fromStore) {
    Object.keys(fromStore).forEach(k => {
      if (out[k]) {
        out[k] = { ...out[k], ...fromStore[k] };
      }
    });
  }
  return out;
}

export // Init the six hours forecast
function initWeatherLong() {
  const spanToUseInHours = 6;
  const out = {};
  const time = Moment()
    .utc()
    .startOf('day');
  const spanEnd = Moment(time)
    .add(8, 'day')
    .startOf('day');
  while (time.isSameOrBefore(spanEnd)) {
    const startTime = Moment(time);
    const endTime = Moment(time).add(spanToUseInHours, 'hours');
    const key = createKeyBasedOnStamps(startTime.toISOString(), endTime.toISOString());
    const diff = endTime.diff(startTime, 'hours');
    const midTime = startTime.add(diff / 2, 'hours');
    const d: WeatherData = {
      temp: null,
      rain: null,
      rainMin: null,
      rainMax: null,
      clouds: null,
      wind: null,
      symbol: null,
      symbolNumber: null,
      sunHeight: null,
      time: midTime.valueOf(),
    };
    out[key] = d;
    time.add(spanToUseInHours, 'hours');
  }

  // Load localstore if applicable, and write to output item if applicable
  const fromStore = store.get(`weatherLong_${localStorageKey}`);
  if (fromStore) {
    Object.keys(fromStore).forEach(k => {
      if (out[k]) {
        out[k] = { ...out[k], ...fromStore[k] };
      }
    });
  }
  return out;
}

// Store a weather data set to localstore, filtered on time. Must have a time key in object, that is a momentish thing!
export function storeToLocalStore(key: string, data: any, from: object, to: object) {
  const toStore = {};
  Object.keys(data).forEach(k => {
    const d = data[k];
    if (!d.time) return;
    if (Moment(d.time).isBetween(from, to, undefined, '[]')) {
      toStore[k] = d;
    }
  });
  store.set(key, toStore);
}
