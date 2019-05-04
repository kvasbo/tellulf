import { UPDATE_SOLAR_CURRENT, UPDATE_SOLAR_MAX } from './actions';

const initialState = {
  max: { maxDay: 0, maxMonth: 0, maxYear: 0, maxEver: 0 }, 
  current: {},
};

export default function Solar(state = initialState, action: { type: string, data: object }) {
  switch (action.type) {
    case UPDATE_SOLAR_MAX: {
      return { ...state, max: { ...state.max, ...action.data } };
    }
    case UPDATE_SOLAR_CURRENT: {
      return { ...state, current: { ...state.current, ...action.data } };
    }
    default:
      return state;
  }
}
