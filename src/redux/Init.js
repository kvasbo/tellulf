import { UPDATE_INIT_STATUS } from './actions';

export function Init(state = {}, action) {
  switch (action.type) {
    case UPDATE_INIT_STATUS: {
      const newState = { ...state };
      newState[action.key] = !!action.value;
      return newState;
    }
    default:
      return state;
  }
}
