import { combineReducers } from 'redux';
import { Weather } from './Weather';
import { Netatmo } from './Netatmo';
import { Init } from './Init';
import { Solar } from './Solar';
import { PowerPrices } from './PowerPrices';

const tellulfReducer = combineReducers({
  Init,
  Netatmo,
  Solar,
  PowerPrices,
  Weather,
});

export default tellulfReducer;
