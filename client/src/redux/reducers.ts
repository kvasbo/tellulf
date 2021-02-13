import { combineReducers } from 'redux';
import { ForecastStore, NowcastStore } from '../types/forecast';
import { InitState } from '../types/initstate';
import { SolarState } from '../types/solar';
import { PowerPriceState, TibberRealTimeDataState, TibberUsageState } from '../types/tibber';
import { TrainDataSet } from '../types/trains';
import Forecast from './Forecast';
import Netatmo, { NetatmoStore } from './Netatmo';
import NetatmoAverages, { NetatmoAverageData } from './NetatmoAverages';
import Init from './Init';
import Nowcast from './Nowcast';
import PowerPrices from './PowerPrices';
import Solar from './Solar';
import TibberLastDay from './TibberLastDay';
import TibberRealTime from './TibberRealTimeData';
import Trains from './Trains';

export interface AppStore {
  Init: InitState;
  Netatmo: NetatmoStore;
  NetatmoAverages: NetatmoAverageData;
  Nowcast: NowcastStore;
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
  Nowcast,
  Solar,
  PowerPrices,
  Trains,
  TibberRealTime,
  TibberLastDay,
  Forecast,
});

export default tellulfReducer;
