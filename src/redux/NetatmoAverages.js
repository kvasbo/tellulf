import { NETATMO_UPDATE_AVERAGES } from './actions';

export default function NetatmoAverages(state = {}, action) {
  switch (action.type) {
    case NETATMO_UPDATE_AVERAGES: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
