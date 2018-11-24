import { combineReducers } from 'redux';
import Weather from './Weather';
import Netatmo from './Netatmo';
import NetatmoAverages from './NetatmoAverages';
import Init from './Init';
import Solar from './Solar';
import PowerPrices from './PowerPrices';
import Trains from './Trains';

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
