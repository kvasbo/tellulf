import { cloneDeep } from 'lodash';
import { UPDATE_SOLAR_CURRENT, UPDATE_SOLAR_MAX } from './actions';

const initialState = {
  max: {},
  current: {},
};

export function Solar(state = initialState, action) {
  switch (action.type) {
    case UPDATE_SOLAR_MAX: {
      return { ...state, max: { ...state.max, ...action.data } }
    }
    case UPDATE_SOLAR_CURRENT: {
      return { ...state, current: { ...state.current, ...action.data } }
    }
    default:
      return state
    }
}