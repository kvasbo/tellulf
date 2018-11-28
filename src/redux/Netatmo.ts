import { NETATMO_UPDATE } from './actions';

export interface store {
  co2: number,
  inneFukt: number,
  inneTemp: number,
  inneTrykk: number,
  inneTrykkTrend: String,
  updated: number | null,
  updatedNice: String,
}

const initialState = {
  co2: 0,
  inneFukt: 0,
  inneTemp: 0,
  inneTrykk: 0,
  inneTrykkTrend: "",
  updated: null,
  updatedNice: "",
};

export default function Netatmo(state: store = initialState, action: { type: string, data: object }) {
  switch (action.type) {
    case NETATMO_UPDATE: {
      return { ...state, ...action.data };
    }
    default:
      return state;
  }
}
