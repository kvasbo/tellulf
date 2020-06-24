import { combineReducers } from 'redux';

import Forecast from './Forecast';
import Netatmo, { NetatmoStore } from './Netatmo';
import NetatmoAverages, { NetatmoAverageData } from './NetatmoAverages';
import Init from './Init';
import Solar from './Solar';
import PowerPrices from './PowerPrices';
import Trains from './Trains';
import TibberRealTime from './TibberRealTimeData';
import TibberLastDay from './TibberLastDay';

import { TrainDataSet } from '../types/trains';
import { SolarState } from '../types/solar';
import { InitState } from '../types/initstate';
import { ForecastStore } from '../types/forecast';
import { TibberRealTimeDataState, TibberUsageState, PowerPriceState } from '../types/tibber';

export interface AppStore {
  Init: InitState;
  Netatmo: NetatmoStore;
  NetatmoAverages: NetatmoAverageData;
  Solar: SolarState;
  PowerPrices: PowerPriceState;
  Trains: TrainDataSet;
  TibberRealTime: TibberRealTimeDataState;
  TibberLastDay: TibberUsageState;
  Forecast: ForecastStore;
}

const tellulfReducer = combineReducers({
  Init,
  Netatmo,
  NetatmoAverages,
  Solar,
  PowerPrices,
  Trains,
  TibberRealTime,
  TibberLastDay,
  Forecast,
});

export default tellulfReducer;
