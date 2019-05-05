import Moment from 'moment';
import { UPDATE_TIBBER_POWER_USAGE } from './actions';

export default function TibberLastDay(state = {}, action: { type: string; data: [] }) {
  switch (action.type) {
    case UPDATE_TIBBER_POWER_USAGE: {
      const now = Moment();
      const newState = {};
      action.data.forEach((d: any) => {
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
