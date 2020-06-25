import { Action } from 'redux';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { UPDATE_FORECAST } from './actions';
import {
  WeatherDataSeries,
  ForecastStore,
  ForecastDataSet,
  WeatherLimits,
  HourForecast,
} from '../types/forecast';

const initalLimits: WeatherLimits = {
  maxRain: 0,
  maxTemp: 0,
  upperRange: 0,
  lowerRange: 0,
  minTemp: 0,
  ticks: [],
};

const initialState: ForecastStore = {
  data: {},
  limits: initalLimits,
};

interface KnownAction {
  type: string;
  data: {
    forecast: WeatherDataSeries;
  };
  lat: number;
  lon: number;
  sted: string;
}

export default function Weather(
  state: ForecastStore = initialState,
  incomingAction: Action,
): ForecastStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_FORECAST: {
      const newState: ForecastStore = { ...state };

      newState.data[action.sted] = {
        lat: action.lat,
        lon: action.lon,
        forecast: action.data,
      };

      // Calculate all the limits
      newState.limits = parseLimits(newState.data);

      return newState;
    }
    default:
      return state;
  }
}

// Calculate global limits
function parseLimits(d: ForecastDataSet): WeatherLimits {
  // Merge the datasets
  const points: HourForecast[] = [];
  Object.values(d).forEach((s) => {
    Object.values(s.forecast).forEach((v: HourForecast) => {
      points.push(v);
    });
  });

  // Calculate the limits
  const maxTempPoint = maxBy(points, 'temp');
  const maxRainPoint = maxBy(points, 'rainMax');
  const minTempPoint = minBy(points, 'temp');

  const minTemp = minTempPoint && minTempPoint.temp ? minTempPoint.temp : 0;
  const maxTemp = maxTempPoint && maxTempPoint.temp ? maxTempPoint.temp : 0;
  const maxRain = maxRainPoint && maxRainPoint.rainMax ? maxRainPoint.rainMax : 0;

  const roundedMin = Math.floor((minTemp - 2) / 10) * 10;
  const roundedMax = Math.ceil((maxTemp + 2) / 10) * 10;

  const lowerRange = minTemp > 0 ? 0 : Math.min(0, roundedMin);
  const upperRange = Math.max(lowerRange + 30, roundedMax);

  const ticks: number[] = [];
  for (let i = lowerRange; i <= upperRange; i += 10) {
    ticks.push(i);
  }

  return {
    minTemp,
    maxTemp,
    maxRain,
    lowerRange,
    upperRange,
    ticks,
  };
}
