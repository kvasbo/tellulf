import { Action } from 'redux';
import { UPDATE_NOWCAST } from './actions';

interface KnownAction {
  type: string;
  temp?: number;
}

export default function Nowcast(state = -999, incomingAction: Action): number {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_NOWCAST: {
      console.log('Got nowcast!');
      return action.temp ? action.temp : -999;
    }
    default:
      return state;
  }
}
