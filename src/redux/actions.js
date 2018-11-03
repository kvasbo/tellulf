import getWeatherFromYr from '../weather/updateWeather';

export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const UPDATE_WEATHER_LONG = 'UPDATE_WEATHER_LONG';
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

export function updateWeather(data, lat, long) {
  return {
    type: UPDATE_WEATHER,
    data,
    lat,
    long,
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

export function updateWeatherLong(data, lat, long) {
  return {
    type: UPDATE_WEATHER_LONG,
    data,
    lat,
    long,
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

export function fetchWeather(lat, long) {
  return (dispatch) => {
    return getWeatherFromYr(lat, long).then(
      weather => dispatch(updateWeather(weather, lat, long)),
      weather => dispatch(updateWeatherLong(weather, lat, long)),
    );
  };
}
