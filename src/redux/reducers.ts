import { combineReducers } from 'redux';

import Weather from './Weather';
import Netatmo from './Netatmo';
import NetatmoAverages from './NetatmoAverages';
import Init from './Init';
import Solar from './Solar';
import Settings from './settings';
import PowerPrices from './PowerPrices';
import Trains from './Trains';
import TibberRealTime from './TibberRealTimeData';
import TibberLastDay from './TibberLastDay';

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
