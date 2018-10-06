import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import tellulfReducer from './reducers';

export const store = createStore(
  tellulfReducer, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
  applyMiddleware(thunk),
);
