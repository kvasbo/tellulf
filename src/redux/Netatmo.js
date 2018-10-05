import { NETATMO_UPDATE } from './actions';

const initialState = {
};

export function Netatmo(state = initialState, action) {
  switch (action.type) {
    case NETATMO_UPDATE: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
