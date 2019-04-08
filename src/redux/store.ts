import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import throttle from 'lodash.throttle';
import tellulfReducer from './reducers';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
}; 

export const saveState = (state) => {
  try {
    // console.log('saving state!');
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch {
    // ignore write errors
  }
};

const persistedState = loadState();

console.log("State loaded", persistedState);

// eslint-disable-next-line import/prefer-default-export
const store = createStore(
  tellulfReducer, persistedState,
  composeEnhancers(applyMiddleware(thunk)),
);

store.subscribe(throttle(() => {
  saveState({
    TibberRealTime: store.getState().TibberRealTime,
    TibberLastDay: store.getState().TibberLastDay,
    Weather: store.getState().Weather,
  });
}, 1000));

export { store };
