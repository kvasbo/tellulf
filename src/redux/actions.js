import getWeatherFromYr from '../weather/updateWeather';

export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const NETATMO_UPDATE = 'NETATMO_UPDATE';
export const NETATMO_UPDATE_AVERAGES = 'NETATMO_UPDATE_AVERAGES';
export const UPDATE_SOLAR_MAX = 'UPDATE_SOLAR_MAX';
export const UPDATE_SOLAR_CURRENT = 'UPDATE_SOLAR_CURRENT';
export const UPDATE_POWER_PRICES = 'UPDATE_POWER_PRICES';
export const UPDATE_INIT_STATUS = 'UPDATE_INIT_STATUS';

export function updateInitStatus(key, value = true) {
  return {
    type: UPDATE_INIT_STATUS,
    key,
    value,
  };
}

export function updateWeather(data, lat, lon) {
  return {
    type: UPDATE_WEATHER,
    data,
    lat,
    lon,
  };
}

export function updatePowerPrices(data) {
  return {
    type: UPDATE_POWER_PRICES,
    data,
  };
}

export function updateSolarMax(data) {
  return {
    type: UPDATE_SOLAR_MAX,
    data,
  };
}

export function updateSolarCurrent(data) {
  return {
    type: UPDATE_SOLAR_CURRENT,
    data,
  };
}

export function updateNetatmo(data) {
  return {
    type: NETATMO_UPDATE,
    data,
  };
}

export function updateNetatmoAverages(data) {
  return {
    type: NETATMO_UPDATE_AVERAGES,
    data,
  };
}

export function fetchWeather(lat, lon) {
  return (dispatch) => {
    return getWeatherFromYr(lat, lon).then(
      weather => dispatch(updateWeather(weather, lat, lon)),
    );
  };
}
