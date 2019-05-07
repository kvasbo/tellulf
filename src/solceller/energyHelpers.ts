import SunCalc from 'suncalc';
import Moment from 'moment';
import { roundToNumberOfDecimals } from '../TellulfInfoCell';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;

export function getSunForTime(
  time: Date | string | Moment.Moment | number,
  latitude = defaultLatitude,
  longitude = defaultLongitude,
) {
  const s = SunCalc.getPosition(Moment(time).toDate(), latitude, longitude);
  return Math.max(0, s.altitude);
}

export function getMaxSunHeight(latitude = defaultLatitude, longitude = defaultLongitude) {
  try {
    // Get max height of sun in position
    const solstice = Moment('2018-06-21').toDate();
    const sunTimes = SunCalc.getTimes(solstice, latitude, longitude);
    const data = SunCalc.getPosition(sunTimes.solarNoon, latitude, longitude);
    return data.altitude;
  } catch (err) {
    return 1;
  }
}

// Get maximum value for energy scale axis
export function getEnergyScaleMax(data: number): number {
  const maxVal = Math.ceil(data / 1000);
  return Math.max(5, maxVal);
}

export function formatEnergyScaleTick(data: number): string {
  // return Number(data, 10).toLocaleString();
  return `${roundToNumberOfDecimals(data, 1)}`;
}

export function getDataPointObject(): {} {
  const out = {};
  const time = Moment().startOf('day');
  for (let i = 0; i < 144; i += 1) {
    const key = time.valueOf();
    out[key] = {
      time: key,
      production: null,
      price: null,
      consumption: null,
    };
    time.add(10, 'minutes');
  }
  return out;
}

export function getXAxis(): [number, number] {
  const from = Moment()
    .startOf('day')
    .valueOf();
  const to = Moment()
    .endOf('day')
    .valueOf();
  return [from, to];
}

export function getTimeLimits(): { start: Moment.Moment; end: Moment.Moment } {
  const start = Moment().startOf('day');
  const end = Moment()
    .add(1, 'day')
    .startOf('day');
  return { start, end };
}

export function getXTicks(): number[] {
  const { start, end } = getTimeLimits();
  const out = [];
  while (start.isSameOrBefore(end)) {
    if (start.hours() % 2 === 0) {
      out.push(start.valueOf());
    }
    start.add(1, 'hours');
  }
  return out;
}

export function formatTick(data: number): string {
  const time = Moment(data).local();
  return time.format('HH');
}
