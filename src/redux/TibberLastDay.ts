import { UPDATE_TIBBER_POWER_USAGE } from './actions';

export default function TibberLastDay(state = {}, action: { type: string, data: object }) {
  switch (action.type) {
    case UPDATE_TIBBER_POWER_USAGE: {
      return { ...action.data };
    }
    default:
      return state;
  }
}
