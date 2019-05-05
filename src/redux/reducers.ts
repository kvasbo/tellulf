import { combineReducers } from 'redux';

import Weather from './Weather';
import Netatmo, { NetatmoStore } from './Netatmo';
import NetatmoAverages, { NetatmoAverageData } from './NetatmoAverages';
import Init from './Init';
import Solar, { SolarState } from './Solar';
import Settings from './settings';
import PowerPrices from './PowerPrices';
import Trains from './Trains';
import TibberRealTime from './TibberRealTimeData';
import TibberLastDay from './TibberLastDay';

export interface AppStore {
  Init: object;
  Netatmo: NetatmoStore;
  NetatmoAverages: NetatmoAverageData;
  Solar: SolarState;
  Settings: any;
  PowerPrices: any;
  Trains: any;
  TibberRealTime: any;
  TibberLastDay: any;
  Weather: any;
}

const tellulfReducer = combineReducers({
  Init,
  Netatmo,
  NetatmoAverages,
  Solar,
  Settings,
  PowerPrices,
  Trains,
  TibberRealTime,
  TibberLastDay,
  Weather,
});

export default tellulfReducer;
