import { NETATMO_UPDATE_AVERAGES } from './actions';

export default function NetatmoAverages(state = {}, action: { type: string, data: object }) {
  switch (action.type) {
    case NETATMO_UPDATE_AVERAGES: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
