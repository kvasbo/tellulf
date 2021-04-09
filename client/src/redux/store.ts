import { createStore, applyMiddleware, compose } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web
import thunk from 'redux-thunk';
import tellulfReducer from './reducers';

const persistConfig = {
  key: 'root',
  version: 2,
  storage,
  whitelist: ['Yr', 'Nowcast'],
};

// eslint-disable-next-line no-underscore-dangle
const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;

const persistedReducer = persistReducer(persistConfig, tellulfReducer);

const store = createStore(
  persistedReducer /* persistedState , */,
  composeEnhancers(applyMiddleware(thunk)),
);

const persistor = persistStore(store);

export { store, persistor };

export type AppDispatch = typeof store.dispatch;
