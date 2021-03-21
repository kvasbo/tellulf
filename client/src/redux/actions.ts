import getTrains from '../ruter/updateTrains';
import { Forecast } from '../types/forecast';
import {
    houses,
    PowerPriceState,
    TibberConsumptionNode,
    TibberProductionNode,
    TibberRealtimeData
} from '../types/tibber';
import { TrainDataSet } from '../types/trains';
import { getForecastFromYr } from '../weather/updateWeather';
import { AppDispatch } from './store';

export const UPDATE_NOWCAST = 'UPDATE_NOWCAST';
export const UPDATE_FORECAST = 'UPDATE_FORECAST';
export const UPDATE_POWER_PRICES = 'UPDATE_POWER_PRICES';
export const UPDATE_INIT_STATUS = 'UPDATE_INIT_STATUS';
export const UPDATE_TRAINS = 'UPDATE_TRAINS';
export const UPDATE_TIBBER_REALTIME_CONSUMPTION = 'UPDATE_TIBBER_REALTIME_CONSUMPTION';
export const UPDATE_TIBBER_POWER_USAGE = 'UPDATE_TIBBER_POWER_USAGE';
export const UPDATE_TIBBER_USAGE_MONTH = 'UPDATE_TIBBER_USAGE_MONTH';
export const UPDATE_TIBBER_PRODUCTION_MONTH = 'UPDATE_TIBBER_PRODUCTION_MONTH';

export function updateInitStatus(
  key: string,
  value = true,
): { type: 'UPDATE_INIT_STATUS'; key: string; value: boolean } {
  return {
    type: UPDATE_INIT_STATUS,
    key,
    value,
  };
}

export function updateTrains(
  trains: TrainDataSet,
): { type: 'UPDATE_TRAINS'; trains: TrainDataSet } {
  return {
    type: UPDATE_TRAINS,
    trains,
  };
}

export function updateForecast(
  data: Forecast,
  sted: string,
): { type: 'UPDATE_FORECAST'; data: Forecast; sted: string } {
  return {
    type: UPDATE_FORECAST,
    data,
    sted,
  };
}

export function updateNowcast(temp: number): { type: 'UPDATE_NOWCAST'; temp: number } {
  return {
    type: UPDATE_NOWCAST,
    temp,
  };
}

export function updateTibberProductionMonth(
  data: TibberProductionNode[],
): { type: 'UPDATE_TIBBER_PRODUCTION_MONTH'; data: TibberProductionNode[] } {
  return {
    type: UPDATE_TIBBER_PRODUCTION_MONTH,
    data,
  };
}

export function updateTibberConsumptionMonth(
  data: TibberConsumptionNode[],
): { type: 'UPDATE_TIBBER_USAGE_MONTH'; data: TibberConsumptionNode[] } {
  return {
    type: UPDATE_TIBBER_USAGE_MONTH,
    data,
  };
}

export function updateRealtimeConsumption(
  data: TibberRealtimeData,
  where: houses,
): { type: 'UPDATE_TIBBER_REALTIME_CONSUMPTION'; data: TibberRealtimeData; where: houses } {
  return {
    type: UPDATE_TIBBER_REALTIME_CONSUMPTION,
    data,
    where,
  };
}

export function updatePowerUsage(
  data: TibberProductionNode[],
): { type: 'UPDATE_TIBBER_POWER_USAGE'; data: TibberProductionNode[] } {
  return {
    type: UPDATE_TIBBER_POWER_USAGE,
    data,
  };
}

export function updatePowerPrices(
  data: PowerPriceState,
): { type: 'UPDATE_POWER_PRICES'; data: PowerPriceState } {
  return {
    type: UPDATE_POWER_PRICES,
    data,
  };
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function fetchTrains(): { (dispatch: AppDispatch): unknown } {
  return (dispatch: AppDispatch): unknown => {
    return getTrains().then((trains) => dispatch(updateTrains(trains)));
  };
}

export function fetchForecast(lat: number, lon: number, sted: string) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
  return (dispatch: AppDispatch) => {
    return getForecastFromYr(lat, lon).then((forecast) => dispatch(updateForecast(forecast, sted)));
  };
}
