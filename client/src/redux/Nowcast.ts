import { Action } from 'redux';
import { NowcastStore } from '../types/forecast';
import { UPDATE_NOWCAST } from './actions';

interface KnownAction {
  type: string;
  temp?: number;
}

export default function Nowcast(state = { temp: -999 }, incomingAction: Action): NowcastStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_NOWCAST: {
      const temp = action.temp ? action.temp : -999;
      return { temp };
    }
    default:
      return state;
  }
}
