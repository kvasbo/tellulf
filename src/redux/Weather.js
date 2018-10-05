import Moment from 'moment';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import SunCalc from 'suncalc';
import { UPDATE_WEATHER, PRUNE_WEATHER, UPDATE_WEATHER_LONG } from './actions';

const initialState = {
  weather: undefined,
  long: {},
  limits: undefined,
};

export function Weather(state = initialState, action) {
  switch (action.type) {
    case UPDATE_WEATHER: {
      const from = Moment().startOf('day');
      const to = Moment().add(3, 'day').startOf('day');
      const toFilter = Object.values({ ...state.weather, ...action.data });
      const filtered = toFilter.filter((w) => {
        return Moment(w.time).isBetween(from, to, null, "[]");
      });
      const newWeather = {};
      filtered.forEach((w) => {
        newWeather[w.time] = w;
      });
      return { ...state, weather: newWeather, limits: parseLimits(action.data) }
    }
    case UPDATE_WEATHER_LONG: {
      return { ...state, long: { ...state.long, ...action.data } }
    }
    case PRUNE_WEATHER: {
      break;
    }
    default:
      return state
  }
}

function parseLimits(data) {
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
  const roundedMin = Math.floor(minTemp / 10) * 10;
  const roundedMax = Math.ceil(maxTemp / 10) * 10;
  let upperRange = 20;
  let lowerRange = -20;
  let ticks = [-10, 0, 10];
  if (roundedMin >= 0) {
    upperRange = Math.max(30, roundedMax);
    lowerRange = 0;
    ticks = [10, 20, 30];
  } else if (roundedMax < 0) {
    upperRange = 0;
    lowerRange = Math.min(-30, roundedMin);
    ticks = [-10, -20, -30];
  } else {
    upperRange = roundedMax;
    lowerRange = roundedMin;
    // ticks = [-10, -20, -30, 0, 10, 20];
  }
  const sunData = getSunMeta();
  const out = {
    lowerRange, upperRange, maxRain, maxRainTime, maxTemp, maxTempTime, minTemp, minTempTime, ticks, ...sunData,
  };
  return out;
}

function getSunMeta() {
  const now = new Moment();
  const yesterday = new Moment(now).subtract(1, 'days');
  const sunTimes = SunCalc.getTimes(new Date(), 59.9409, 10.6991);
  const sunTimesYesterday = SunCalc.getTimes(yesterday.toDate(), 59.9409, 10.6991);
  const sunriseM = new Moment(sunTimes.sunrise);
  const sunsetM = new Moment(sunTimes.sunset);
  const sunriseYesterday = new Moment(sunTimesYesterday.sunrise);
  const sunsetYesterday = new Moment(sunTimesYesterday.sunset);
  const diffRise = sunriseM.diff(sunriseYesterday, 'minutes') - 1440;
  const diffSet = sunsetM.diff(sunsetYesterday, 'minutes') - 1440;
  const sunrise = sunriseM.valueOf();
  const sunset = sunsetM.valueOf();
  return {
    sunrise, sunset, diffRise, diffSet,
  };
}
