import { UPDATE_SETTING } from './actions';

export type settings = {
  solarMaxDynamic: boolean
}

const initialState = {
  solarMaxDynamic: false,
};

export default function Settings(state: settings = initialState, action: { type: string, key: string, value: any }) {
  switch (action.type) {
    case UPDATE_SETTING: {
      const newState = { ...state };
      newState[action.key] = action.value
      return newState;
    }
    default:
      return state;
  }
}
