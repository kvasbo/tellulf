import { UPDATE_INIT_STATUS } from './actions';

interface state {
  powerPrices: boolean,
  solar: boolean,
}

export default function Init(state: state = { powerPrices: false, solar: false }, action: { type: string, key: string, value: any }) {
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
