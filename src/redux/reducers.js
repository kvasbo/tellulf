import { combineReducers } from 'redux';
import { Weather } from './Weather';
import { Netatmo } from './Netatmo';
import { Solar } from './Solar';
import { PowerPrices } from './PowerPrices';

const tellulfReducer = combineReducers({
  Weather,
  Netatmo,
  Solar,
  PowerPrices,
});

export default tellulfReducer;
