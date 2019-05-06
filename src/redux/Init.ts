import { UPDATE_INIT_STATUS } from './actions';

export interface InitState {
  powerPrices: boolean;
  solar: boolean;
}

export default function Init(
  state: InitState = { powerPrices: false, solar: false },
  action: { type: string; key: string; value: any },
) {
  switch (action.type) {
    case UPDATE_INIT_STATUS: {
      const newState: any = { ...state };
      newState[action.key] = !!action.value;
      return newState;
    }
    default:
      return state;
  }
}
