import { combineReducers } from 'redux';
import { NowcastStore } from '../types/forecast';
import { YrStore } from '../types/yr';
import { PowerPriceState, TibberRealTimeDataState } from '../types/tibber';
import { TrainDataSet } from '../types/trains';
import Nowcast from './Nowcast';
import PowerPrices from './PowerPrices';
import TibberRealTime from './TibberRealTimeData';
import Trains from './Trains';
import Yr from './Yr';

export interface AppStore {
  Nowcast: NowcastStore;
  PowerPrices: PowerPriceState;
  Trains: TrainDataSet;
  TibberRealTime: TibberRealTimeDataState;
  Yr: YrStore;
}

const tellulfReducer = combineReducers({
  Nowcast,
  PowerPrices,
  Trains,
  TibberRealTime,
  Yr,
});

export default tellulfReducer;
