import { UPDATE_INIT_STATUS } from './actions';
import { InitState } from '../types/initstate';

export default function Init(
  state: InitState = { powerPrices: false, solar: false },
  action: { type: string; key: string; value: boolean },
) {
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
