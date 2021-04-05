import { Action } from 'redux';

import { UPDATE_YR } from './actions';
import { YrWeatherDataset, YrStore } from '../types/yr';

const initialState: YrStore = {};

interface KnownAction {
  type: string;
  data: YrWeatherDataset[];
  sted: string;
}

export default function Yr(state: YrStore = initialState, incomingAction: Action): YrStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_YR: {
      const newState: YrStore = { ...state };

      action.data.forEach((d) => {
        state[d.time] = d;
      });

      return newState;
    }
    default:
      return state;
  }
}
