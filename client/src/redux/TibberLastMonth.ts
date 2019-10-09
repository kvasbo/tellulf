import Moment from 'moment';
import { Action } from 'redux';
import { UPDATE_TIBBER_POWER_USAGE } from './actions';

import { TibberUsageAPIData, TibberUsageState } from '../types/tibber';

interface KnownAction {
  type: string;
  data: [TibberUsageAPIData];
}

export default function TibberLastDay(state = {}, incomingAction: Action): TibberUsageState {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_TIBBER_POWER_USAGE: {
      const now = Moment();
      const newState: TibberUsageState = {};
      action.data.forEach(d => {
        const to = Moment(d.to);
        const from = Moment(d.from);
        if (to.isSame(now, 'day') && from.isSame(now, 'day')) {
          const fromH = from.format('H');
          const calculatedTime = Moment(from)
            .add(30, 'minutes')
            .valueOf();
          newState[fromH] = { ...d, calculatedTime };
        }
      });
      return newState;
    }
    default:
      return state;
  }
}
