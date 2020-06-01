import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import tellulfReducer from './reducers';

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const store = createStore(
  tellulfReducer /* persistedState , */,
  composeEnhancers(applyMiddleware(thunk)),
);

export { store };

export type AppDispatch = typeof store.dispatch;
