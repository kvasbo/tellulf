import Moment from 'moment';
import SunCalc from 'suncalc';
import store from 'store';
import { getNorwegianDaysOff } from '../external';
import { WeatherData, WeatherDataSet } from '../types/weather';
import { localStorageKey } from './updateWeather';
import { string } from 'prop-types';

const useLocalStorage = true;
const sundayColor = '#FF0000CC';
const redDays = getNorwegianDaysOff();
const gridColor = '#FFFFFFAA';

export function getTimeLimits(days = 3) {
  const start = Moment().startOf('day');
  const end = Moment().add(days, 'day').startOf('day');
  return { start, end };
}

export function getDayColor(time: Moment.Moment) {
  if (time.day() === 0 || time.day() === 6) return sundayColor;
  const dString = time.format('MMDD');
  if (redDays.includes(dString)) return sundayColor;
  return gridColor;
}

export function formatTick(data: number) {
  const time = Moment(data, 'x');
  return time.format('HH');
}

export function getSunMeta(lat: number, long: number, now: Moment.Moment = Moment()) {
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

// Populate a default weather data set
export function getDefaultWeatherDataSet(
  startTime: Moment.Moment,
  endTime: Moment.Moment,
): WeatherData {
  const diff = endTime.diff(startTime, 'hours');
  const midTime = startTime.add(Math.round(diff / 2), 'hours');
  return {
    from: startTime.valueOf(),
    to: endTime.valueOf(),
    temp: null,
    rain: null,
    rainMin: null,
    rainMax: null,
    symbol: 'blank',
    symbolNumber: 0,
    time: midTime.valueOf(),
  };
}

export function initWeather(
  spanToUseInHours: number,
  daysToInit: number,
  storageKey: string,
): WeatherDataSet {
  const out: WeatherDataSet = {};
  const time = Moment().utc().startOf('day');
  const spanEnd = Moment(time).add(daysToInit, 'day').startOf('day');
  while (time.isSameOrBefore(spanEnd)) {
    const startTime = Moment(time);
    const endTime = Moment(time).add(spanToUseInHours, 'hours');
    const key = createKeyBasedOnStamps(startTime.toISOString(), endTime.toISOString());
    const d: WeatherData = getDefaultWeatherDataSet(startTime, endTime);
    out[key] = d;
    time.add(spanToUseInHours, 'hours');
  }

  // Load localstore if applicable, and write to output item if applicable
  const fromStore = store.get(`${storageKey}_${localStorageKey}`);
  if (useLocalStorage && fromStore) {
    Object.keys(fromStore).forEach((k) => {
      if (out[k]) {
        out[k] = { ...out[k], ...fromStore[k] };
      }
    });
  }
  return out;
}

// Store a weather data set to localstore, filtered on time. Must have a time key in object, that is a momentish thing!
export function storeToLocalStore(key: string, data: object, from: object, to: object) {
  const toStore = {};
  Object.keys(data).forEach((k) => {
    const d = data[k];
    if (!d.time) return;
    if (Moment(d.time).isBetween(from, to, undefined, '[]')) {
      toStore[k] = d;
    }
  });
  store.set(key, toStore);
}
