export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const UPDATE_WEATHER_LONG = 'UPDATE_WEATHER_LONG';
export const UPDATE_WEATHER_LIMITS = 'UPDATE_WEATHER_LIMITS';
export const PRUNE_WEATHER = 'PRUNE_WEATHER';
export const NETATMO_UPDATE = 'NETATMO_UPDATE';

export function updateWeather(data) {
  return {
    type: UPDATE_WEATHER,
    data,
  };
}

export function updateWeatherLong(data) {
  return {
    type: UPDATE_WEATHER_LONG,
    data,
  };
}

export function updateWeatherLimits(limits) {
  return {
    type: UPDATE_WEATHER_LIMITS,
    limits,
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
