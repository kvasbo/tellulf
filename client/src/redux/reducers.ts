import { combineReducers } from 'redux';
import { ForecastStore, NowcastStore } from '../types/forecast';
import { InitState } from '../types/initstate';
import { PowerPriceState, TibberRealTimeDataState, TibberUsageState } from '../types/tibber';
import { TrainDataSet } from '../types/trains';
import Forecast from './Forecast';
import Init from './Init';
import Nowcast from './Nowcast';
import PowerPrices from './PowerPrices';
import TibberLastDay from './TibberLastDay';
import TibberRealTime from './TibberRealTimeData';
import Trains from './Trains';

export interface AppStore {
  Init: InitState;
  Nowcast: NowcastStore;
  PowerPrices: PowerPriceState;
  Trains: TrainDataSet;
  TibberRealTime: TibberRealTimeDataState;
  TibberLastDay: TibberUsageState;
  Forecast: ForecastStore;
}

const tellulfReducer = combineReducers({
  Init,
  Nowcast,
  PowerPrices,
  Trains,
  TibberRealTime,
  TibberLastDay,
  Forecast,
});

export default tellulfReducer;
