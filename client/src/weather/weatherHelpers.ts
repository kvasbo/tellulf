import Moment from 'moment';
import store from 'store';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import sumBy from 'lodash/sumBy';
import { getNorwegianDaysOff } from '../external';
import { WeatherDataSeries, HourForecast } from '../types/forecast';

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

export function createForecastSummary(data: WeatherDataSeries): string {
  const weather = Object.values(data);
  if (weather.length === 0) return '';
  const maxTemp = maxBy(weather, (w: HourForecast): number => {
    return w.temp ? w.temp : -999;
  });
  const minTemp = minBy(weather, (w: HourForecast): number => {
    return w.temp ? w.temp : 999;
  });

  const rain = sumBy(weather, (w: HourForecast): number => {
    if (!w.rain) return 0;
    return w.rain;
  });

  const maxT = maxTemp && maxTemp.temp ? Math.round(maxTemp.temp) : undefined;
  const minT = minTemp && minTemp.temp ? Math.round(minTemp.temp) : undefined;
  const r = Math.round(rain);

  if (!maxT || !minT) {
    return '';
  }

  return `${minT}/${maxT} ${r}mm`;
}
