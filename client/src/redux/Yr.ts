import { Action } from 'redux';
import Moment from 'moment';
import { UPDATE_YR } from './actions';
import { YrWeatherDataset, YrStore, YrWeatherSeries } from '../types/yr';

const initialState: YrStore = {};

interface KnownAction {
  type: string;
  data: YrWeatherDataset[];
  sted: string;
}

export default function Yr(state: YrStore = initialState, incomingAction: Action): YrStore {
  const action = incomingAction as KnownAction;
  switch (action.type) {
    case UPDATE_YR: {
      const newState: YrStore = { ...state };

      action.data.forEach((d) => {
        if (!newState[action.sted]) {
          newState[action.sted] = {};
        }
        newState[action.sted][d.time] = d;
      });

      // Remove old datas
      const filtered: YrStore = {};
      for (const sted in newState) {
        const now = Moment();
        const pre: YrWeatherSeries = newState[sted];

        filtered[sted] = {};

        for (const time in pre) {
          const date = Moment(time);
          if (!date.isBefore(now, 'day')) {
            filtered[sted][time] = pre[time];
          }
        }
      }

      return filtered;
    }
    default:
      return state;
  }
}
