import { Action } from 'redux';
import { NowcastStore } from '../types/forecast';
import { UPDATE_NOWCAST } from './actions';

interface KnownAction {
  type: string;
  temp?: number;
}

export default function Nowcast(
  state = { temp: -999, time: new Date().toISOString() },
  incomingAction: Action,
): NowcastStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_NOWCAST: {
      const temp = action.temp ? Math.round(action.temp) : -999;
      const time = new Date().toISOString();
      return { temp, time };
    }
    default:
      return state;
  }
}
