import { combineReducers } from 'redux';
import Weather from './Weather';
import Netatmo from './Netatmo';
import NetatmoAverages from './NetatmoAverages';
import Init from './Init';
import Solar from './Solar';
import PowerPrices from './PowerPrices';

const tellulfReducer = combineReducers({
  Init,
  Netatmo,
  NetatmoAverages,
  Solar,
  PowerPrices,
  Weather,
});

export default tellulfReducer;
