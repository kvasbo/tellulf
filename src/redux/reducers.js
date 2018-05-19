import { combineReducers } from 'redux';
import { Weather } from './Weather';
import { Netatmo } from './Netatmo';
import { Solar } from './Solar';

const tellulfReducer = combineReducers({
  Weather,
  Netatmo,
  Solar,
});

export default tellulfReducer;
