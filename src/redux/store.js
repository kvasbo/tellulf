import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

import tellulfReducer from './reducers';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// eslint-disable-next-line import/prefer-default-export
export const store = createStore(
  tellulfReducer, /* preloadedState, */
  composeEnhancers(applyMiddleware(thunk)),
);
