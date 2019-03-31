import { UPDATE_TIBBER_REALTIME_CONSUMPTION } from './actions';

export default function TibberRealTime(state = {}, action: { type: string, data: object }) {
  switch (action.type) {
    case UPDATE_TIBBER_REALTIME_CONSUMPTION: {
      return { ...action.data };
    }
    default:
      return state;
  }
}
