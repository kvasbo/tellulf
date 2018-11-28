import { combineReducers } from 'redux';

import Weather from './Weather.ts';
import Netatmo from './Netatmo.ts';
import NetatmoAverages from './NetatmoAverages.ts';
import Init from './Init.ts';
import Solar from './Solar.ts';
import PowerPrices from './PowerPrices.ts';
import Trains from './Trains.ts';

const tellulfReducer = combineReducers({
  Init,
  Netatmo,
  NetatmoAverages,
  Solar,
  PowerPrices,
  Trains,
  Weather,
});

export default tellulfReducer;
