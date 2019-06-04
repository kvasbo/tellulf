import { Action } from 'redux';
import { UPDATE_TRAINS } from './actions';
import { TrainDataSet } from '../types/trains';

interface KnownAction {
  type: string;
  trains: TrainDataSet;
}

export default function Trains(state: TrainDataSet = {}, incomingAction: Action): TrainDataSet {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_TRAINS: {
      return { ...action.trains };
    }
    default:
      return state;
  }
}
