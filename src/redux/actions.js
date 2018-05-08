export const UPDATE_WEATHER = 'UPDATE_WEATHER';
export const UPDATE_WEATHER_LIMITS = 'UPDATE_WEATHER_LIMITS';
export const PRUNE_WEATHER = 'PRUNE_WEATHER';

export function updateWeather(data) {
  return {
    type: UPDATE_WEATHER,
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
