import Cookies from 'js-cookie';
import { UPDATE_SETTING } from './actions';

const solarMaxDynamic = (Cookies.get('solarMaxDynamic')) ? (Cookies.get('solarMaxDynamic') == 'true') : false;

export type settings = {
  solarMaxDynamic: boolean,
}

const initialState = {
  solarMaxDynamic,
};

export default function Settings(state: settings = initialState, action: { type: string, key: string, value: any }) {
  switch (action.type) {
    case UPDATE_SETTING: {
      const newState = { ...state };
      newState[action.key] = action.value;
      Cookies.set(action.key, action.value);
      return newState;
    }
    default:
      return state;
  }
}
