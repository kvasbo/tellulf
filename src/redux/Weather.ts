import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import SunCalc from 'suncalc';
import { UPDATE_WEATHER } from './actions';

interface state {
  weather: {} | undefined,
  long: {},
  limits: {} | undefined,
  lat: number | undefined,
  lon: number | undefined,
  todayMinMax: { min: number | undefined, max: number | undefined },
}

interface weatherData {
  temp: number | null,
  rain: number | null,
  rainMin: number | null,
  rainMax: number | null,
  clouds: number | null,
  wind: number | null,
  symbol: string | null,
  symbolNumber: number | null,
  sunHeight: number | null,
  time: string | number,
}

const initialState = {
  weather: undefined,
  long: {},
  limits: undefined,
  lat: undefined,
  lon: undefined,
  todayMinMax: { min: undefined, max: undefined },
};

export default function Weather(state: state = initialState, action: { type: string, data: any, lat: number, lon: number }) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment().add(3, 'day').startOf('day');
      const toFilter = Object.values({ ...state.weather as weatherData, ...action.data.weather as weatherData });
      const filtered = toFilter.filter((w) => {
        if (!w) return false;
        return Moment(w['time']).isBetween(from, to, undefined, '[]');
      });
      const newWeather = {};
      filtered.forEach((w) => {
        if (!w) return false;
        newWeather[w['time']] = w;
      });
      return {
        ...state,
        lat: action.lat,
        lon: action.lon,
        weather: newWeather,
        long: { ...action.data.long },
        todayMinMax: action.data.todayMinMax,
        limits: parseLimits(action.data.weather, action.lat, action.lon),
      };
    }
    default:
      return state;
  }
}

function parseLimits(data, lat, long) {
  const dataArray = Object.values(data);
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
  const lowerRange = Math.min(0, roundedMin);
  const upperRange = Math.max(roundedMin + 30, roundedMax);

  const ticks: number[] = [];
  for (let i = lowerRange; i <= upperRange; i += 10) {
    ticks.push(i);
  }

  const sunData = getSunMeta(lat, long);
  const out = {
    lowerRange, upperRange, maxRain, maxRainTime, maxTemp, maxTempTime, minTemp, minTempTime, ticks, ...sunData,
  };
  return out;
}

function getSunMeta(lat, long) {
  const now = Moment();
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
