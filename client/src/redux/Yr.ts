import { Action } from 'redux';
import { DateTime } from 'luxon';
import { UPDATE_YR } from './actions';
import { YrWeatherDataset, YrStore, YrWeatherSeries } from '../types/yr';
import { ForecastPlace } from '../types/forecast';

const initialState: YrStore = {};

interface KnownAction {
  type: string;
  data: YrWeatherDataset[];
  sted: ForecastPlace;
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
        const timeStamp = DateTime.fromISO(d.time).valueOf();
        newState[action.sted][timeStamp] = d;
      });

      // Remove old datas
      const filtered: YrStore = {};
      for (const sted in newState) {
        const startOfDay = DateTime.fromJSDate(new Date()).startOf('day').valueOf();
        const pre: YrWeatherSeries = newState[sted];

        filtered[sted] = {};

        for (const time in pre) {
          if (Number(time) > startOfDay) {
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
