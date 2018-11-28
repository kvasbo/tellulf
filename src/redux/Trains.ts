import { UPDATE_TRAINS } from './actions';

export default function Trains(state: {} = {}, action) {
  switch (action.type) {
    case UPDATE_TRAINS: {
      return { ...action.trains };
    }
    default:
      return state;
  }
}
