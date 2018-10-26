import axios from 'axios';
import Moment from 'moment';
import store from 'store';
import XML from 'pixl-xml';

const localStorageKey = '1';

export default async function getWeatherFromYr(lat, long) {
  const weatherOut = initWeather();
  const { start, end } = getTimeLimits();

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
      weatherOut[key].temp = Number(p.location.temperature.value);
      weatherOut[key].time = time.valueOf();
    }
  });
  const sixesOut = {};
  sixes.forEach((s) => {
    const from = Moment(s.from);
    const key = from.valueOf();
    const to = Moment(s.to);
    const time = Moment(from).add(3, 'hours');
    const rain = Number(s.location.precipitation.value, 10);
    const symbol = s.location.symbol.id;
    const minTemp = Number(s.location.minTemperature.value, 10);
    const maxTemp = Number(s.location.maxTemperature.value, 10);
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

  // Overwrite cache
  store.set(`weather_${localStorageKey}`, weatherOut);

  return weatherOut;
}

function initWeather() {
  const out = {};
  const now = new Moment().startOf('day');
  for (let i = 0; i < 72; i += 1) {
    const key = now.valueOf();
    out[key] = {
      temp: null, rain: null, rainMin: null, rainMax: null, symbol: null, symbolNumber: null, sunHeight: null, time: now.valueOf(),
    };
    now.add(1, 'hours');
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
  const start = new Moment().startOf('day');
  const end = new Moment().add(2, 'day').endOf('day');
  return { start, end };
}
