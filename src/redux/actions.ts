import getWeatherFromYr from '../weather/updateWeather';
import getTrains from '../ruter/updateTrains';

import { netatmoStore } from './Netatmo';

export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const NETATMO_UPDATE = 'NETATMO_UPDATE';
export const NETATMO_UPDATE_AVERAGES = 'NETATMO_UPDATE_AVERAGES';
export const UPDATE_SOLAR_MAX = 'UPDATE_SOLAR_MAX';
export const UPDATE_SOLAR_CURRENT = 'UPDATE_SOLAR_CURRENT';
export const UPDATE_POWER_PRICES = 'UPDATE_POWER_PRICES';
export const UPDATE_INIT_STATUS = 'UPDATE_INIT_STATUS';
export const UPDATE_TRAINS = 'UPDATE_TRAINS';

export function updateInitStatus(key, value = true) {
  return {
    type: UPDATE_INIT_STATUS,
    key,
    value,
  };
}

export function updateTrains(trains: {}) {
  return {
    type: UPDATE_TRAINS,
    trains,
  };
}

export function updateWeather(data: {}, lat: number, lon: number) {
  return {
    type: UPDATE_WEATHER,
    data,
    lat,
    lon,
  };
}

export function updatePowerPrices(data: {}) {
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

export function updateNetatmo(data: netatmoStore) {
  return {
    type: NETATMO_UPDATE,
    data,
  };
}

export function updateNetatmoAverages(data: {}) {
  return {
    type: NETATMO_UPDATE_AVERAGES,
    data,
  };
}

export function fetchTrains(station, direction) {
  return (dispatch) => {
    return getTrains(station, direction).then(
      trains => dispatch(updateTrains(trains)),
    );
  };
}

export function fetchWeather(lat, lon) {
  return (dispatch) => {
    return getWeatherFromYr(lat, lon).then(
      weather => dispatch(updateWeather(weather, lat, lon)),
    );
  };
}