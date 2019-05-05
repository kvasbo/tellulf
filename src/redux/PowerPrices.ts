import { UPDATE_POWER_PRICES } from './actions';

export interface PowerPrices {
  [s: number] : { total: number };
}

const initState: PowerPrices = {};

export default function PowerPrices(state: PowerPrices = initState, action: { type: string, data: PowerPrices }) : PowerPrices {
  switch (action.type) {
    case UPDATE_POWER_PRICES: {
      try {
        return { ...action.data };
      } catch (err) {
        console.log(err);
        return initState;
      }
    }
    default:
      return state;
  }
}
