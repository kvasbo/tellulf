export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const UPDATE_WEATHER_LONG = 'UPDATE_WEATHER_LONG';
export const PRUNE_WEATHER = 'PRUNE_WEATHER';
export const NETATMO_UPDATE = 'NETATMO_UPDATE';
export const UPDATE_SOLAR_MAX = 'UPDATE_SOLAR_MAX';
export const UPDATE_SOLAR_CURRENT = 'UPDATE_SOLAR_CURRENT';
export const UPDATE_POWER_PRICES = 'UPDATE_POWER_PRICES';

export function updateWeather(data) {
  return {
    type: UPDATE_WEATHER,
    data,
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

export function updateWeatherLong(data) {
  return {
    type: UPDATE_WEATHER_LONG,
    data,
  };
}

export function pruneWeather(from, to) {
  return {
    type: PRUNE_WEATHER,
    from,
    to,
  };
}

export function updateNetatmo(data) {
  return {
    type: NETATMO_UPDATE,
    data,
  };
}
