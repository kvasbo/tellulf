import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import tellulfReducer from './reducers';

const persistConfig = {
  key: 'tellulf-001',
  storage,
  blacklist: ['Ruter', 'Weather'],
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, tellulfReducer);

export const store = createStore(
  persistedReducer, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export const persistor = persistStore(store);
