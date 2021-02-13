import omitBy from 'lodash/omitBy';
import Moment from 'moment';
import { Action } from 'redux';
import { TrainDataSet } from '../types/trains';
import { UPDATE_TRAINS } from './actions';

interface KnownAction {
  type: string;
  trains: TrainDataSet;
}

export default function Trains(state: TrainDataSet = {}, incomingAction: Action): TrainDataSet {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_TRAINS: {
      // Remove old trains
      const notPassed = omitBy(state, (call) => {
        return Moment().isAfter(call.faktiskTid);
      });
      return { ...notPassed, ...action.trains };
    }
    default:
      return state;
  }
}
