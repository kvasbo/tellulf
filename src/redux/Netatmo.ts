import { NETATMO_UPDATE } from './actions';

export interface NetatmoStore {
  co2: number,
  inneFukt: number,
  inneTemp: number,
  inneTrykk: number,
  inneTrykkTrend: String,
  updated: number | null,
  updatedNice: String,
}

const initialState: NetatmoStore = {
  co2: 0,
  inneFukt: 0,
  inneTemp: 0,
  inneTrykk: 0,
  inneTrykkTrend: "",
  updated: null,
  updatedNice: "",
};

export default function Netatmo(state: NetatmoStore = initialState, action: { type: string, data: NetatmoStore }): NetatmoStore {
  switch (action.type) {
    case NETATMO_UPDATE: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
