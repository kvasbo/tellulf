import { combineReducers } from 'redux';
import { Weather } from './Weather';
import { Netatmo } from './Netatmo';

const tellulfReducer = combineReducers({
  Weather,
  Netatmo,
});

export default tellulfReducer;
