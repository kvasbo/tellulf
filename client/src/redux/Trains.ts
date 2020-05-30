import Moment from 'moment';
import omitBy from 'lodash/omitBy';
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
