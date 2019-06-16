import getWeatherFromYr from '../weather/updateWeather';
import getTrains from '../ruter/updateTrains';

import { NetatmoStore } from './Netatmo';
import { NetatmoAverageData } from './NetatmoAverages';
import { WeatherDataSet } from '../types/weather';
import { TrainDataSet } from '../types/trains';

import {
  PowerPriceState,
  TibberRealtimeData,
  TibberConsumptionNode,
  TibberProductionNode,
} from '../types/tibber';

export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const NETATMO_UPDATE = 'NETATMO_UPDATE';
export const NETATMO_UPDATE_AVERAGES = 'NETATMO_UPDATE_AVERAGES';
export const UPDATE_SOLAR_MAX = 'UPDATE_SOLAR_MAX';
export const UPDATE_SOLAR_CURRENT = 'UPDATE_SOLAR_CURRENT';
export const UPDATE_POWER_PRICES = 'UPDATE_POWER_PRICES';
export const UPDATE_INIT_STATUS = 'UPDATE_INIT_STATUS';
export const UPDATE_TRAINS = 'UPDATE_TRAINS';
export const UPDATE_TIBBER_REALTIME_CONSUMPTION = 'UPDATE_TIBBER_REALTIME_CONSUMPTION';
export const UPDATE_TIBBER_POWER_USAGE = 'UPDATE_TIBBER_POWER_USAGE';
export const UPDATE_TIBBER_USAGE_MONTH = 'UPDATE_TIBBER_USAGE_MONTH';
export const UPDATE_TIBBER_PRODUCTION_MONTH = 'UPDATE_TIBBER_PRODUCTION_MONTH';

export function updateInitStatus(key: string, value = true) {
  return {
    type: UPDATE_INIT_STATUS,
    key,
    value,
  };
}

export function updateTrains(trains: TrainDataSet) {
  return {
    type: UPDATE_TRAINS,
    trains,
  };
}

export function updateWeather(data: WeatherDataSet, lat: number, lon: number, sted: string) {
  return {
    type: UPDATE_WEATHER,
    data,
    lat,
    lon,
    sted,
  };
}

export function updateTibberProductionMonth(data: TibberProductionNode[]) {
  return {
    type: UPDATE_TIBBER_PRODUCTION_MONTH,
    data,
  };
}

export function updateTibberConsumptionMonth(data: TibberConsumptionNode[]) {
  return {
    type: UPDATE_TIBBER_USAGE_MONTH,
    data,
  };
}

export function updateRealtimeConsumption(data: TibberRealtimeData) {
  return {
    type: UPDATE_TIBBER_REALTIME_CONSUMPTION,
    data,
  };
}

export function updatePowerUsage(data: {}) {
  return {
    type: UPDATE_TIBBER_POWER_USAGE,
    data,
  };
}

export function updatePowerPrices(data: PowerPriceState) {
  return {
    type: UPDATE_POWER_PRICES,
    data,
  };
}

export function updateSolarMax(data: {}) {
  return {
    type: UPDATE_SOLAR_MAX,
    data,
  };
}

export function updateSolarCurrent(data: {}) {
  return {
    type: UPDATE_SOLAR_CURRENT,
    data,
  };
}

export function updateNetatmo(data: NetatmoStore) {
  return {
    type: NETATMO_UPDATE,
    data,
  };
}

export function updateNetatmoAverages(data: NetatmoAverageData) {
  return {
    type: NETATMO_UPDATE_AVERAGES,
    data,
  };
}

export function fetchTrains() {
  return (dispatch: Function) => {
    return getTrains().then(trains => dispatch(updateTrains(trains)));
  };
}

export function fetchWeather(lat: number, lon: number, sted: string) {
  return (dispatch: Function) => {
    return getWeatherFromYr(lat, lon).then(weather =>
      dispatch(updateWeather(weather, lat, lon, sted)),
    );
  };
}
