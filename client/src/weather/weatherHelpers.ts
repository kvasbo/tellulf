import Moment from 'moment';
import SunCalc from 'suncalc';
import store from 'store';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { getNorwegianDaysOff } from '../external';
import { HourForecast, WeatherLimits } from '../types/forecast';

const sundayColor = '#FF0000CC';
const redDays = getNorwegianDaysOff();
const gridColor = '#FFFFFFAA';

export function getTimeLimits(days = 3): { start: Moment.Moment; end: Moment.Moment } {
  const start = Moment().startOf('day');
  const end = Moment().add(days, 'day').startOf('day');
  return { start, end };
}

export function getDayColor(time: Moment.Moment): string {
  if (time.day() === 0 || time.day() === 6) return sundayColor;
  const dString = time.format('MMDD');
  if (redDays.includes(dString)) return sundayColor;
  return gridColor;
}

export function formatTick(data: number): string {
  const time = Moment(data, 'x');
  return time.format('HH');
}

interface SunInfo {
  sunrise: number;
  sunset: number;
  diffRise: number;
  diffSet: number;
}

export function getSunMeta(lat: number, long: number, now: Moment.Moment = Moment()): SunInfo {
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

export function createKeyBasedOnStamps(from: string, to: string): string {
  const f = Moment(from);
  const t = Moment(to);
  const key = `${f.toISOString()}->${t.toISOString()}`;
  return key;
}

// Store a weather data set to localstore, filtered on time. Must have a time key in object, that is a momentish thing!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function storeToLocalStore(
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  from: Moment.Moment | string,
  to: Moment.Moment | string,
): void {
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

export function parseLimits(
  rawData: HourForecast[],
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

  const maxRainPoint: HourForecast | undefined = maxBy(data, 'rainMax');
  const maxRain = maxRainPoint && maxRainPoint.rainMax ? maxRainPoint.rainMax : 0;
  const maxRainTime = maxRainPoint ? maxRainPoint.time : 0;
  const maxTempPoint: HourForecast | undefined = maxBy(data, 'temp');
  const maxTemp = maxTempPoint && maxTempPoint.temp ? maxTempPoint.temp : -999;
  const maxTempTime = maxTempPoint ? maxTempPoint.time : 0;
  const minTempPoint: HourForecast | undefined = minBy(data, 'temp');
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
