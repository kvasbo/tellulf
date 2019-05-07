import { combineReducers } from 'redux';

import Weather from './Weather';
import Netatmo, { NetatmoStore } from './Netatmo';
import NetatmoAverages, { NetatmoAverageData } from './NetatmoAverages';
import Init from './Init';
import Solar from './Solar';
import PowerPrices from './PowerPrices';
import Trains from './Trains';
import TibberRealTime from './TibberRealTimeData';
import TibberLastDay from './TibberLastDay';

import { TrainDataSet } from '../types/trains';
import { WeatherStore } from '../types/weather';
import { SolarState } from '../types/solar';
import { TibberRealtimeState, TibberUsageState, PowerPriceState } from '../types/tibber';

export interface AppStore {
  Init: object;
  Netatmo: NetatmoStore;
  NetatmoAverages: NetatmoAverageData;
  Solar: SolarState;
  PowerPrices: PowerPriceState;
  Trains: TrainDataSet;
  TibberRealTime: TibberRealtimeState;
  TibberLastDay: TibberUsageState;
  Weather: WeatherStore;
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
  Weather,
});

export default tellulfReducer;
