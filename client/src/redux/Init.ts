import { UPDATE_INIT_STATUS } from './actions';
import { InitState } from '../types/initstate';
import { Action } from 'redux';

interface KnownAction {
  type: string;
  key: string;
  value: boolean;
}

export default function Init(
  state: InitState = { powerPrices: false, solar: false },
  incomingAction: Action,
): InitState {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_INIT_STATUS: {
      const newState: InitState = { ...state };
      newState[action.key] = action.value;
      return newState;
    }
    default:
      return state;
  }
}
