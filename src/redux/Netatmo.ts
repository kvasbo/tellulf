import { NETATMO_UPDATE } from './actions';
import { Action } from 'redux';

export interface NetatmoStore {
  co2: number;
  inneFukt: number;
  inneTemp: number;
  inneTrykk: number;
  inneTrykkTrend: string;
  updated: number | null;
  updatedNice: string;
}

const initialState: NetatmoStore = {
  co2: 0,
  inneFukt: 0,
  inneTemp: 0,
  inneTrykk: 0,
  inneTrykkTrend: '',
  updated: null,
  updatedNice: '',
};

interface KnownAction {
  type: string;
  data: NetatmoStore;
}

export default function Netatmo(
  state: NetatmoStore = initialState,
  incomingAction: Action,
): NetatmoStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case NETATMO_UPDATE: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
