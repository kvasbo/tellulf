import { UPDATE_TRAINS } from './actions';
import { TrainDataSet } from '../types/trains';

export default function Trains(
  state: TrainDataSet = {},
  action: { type: string; trains: TrainDataSet },
): TrainDataSet {
  switch (action.type) {
    case UPDATE_TRAINS: {
      return { ...action.trains };
    }
    default:
      return state;
  }
}
