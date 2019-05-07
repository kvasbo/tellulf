import { UPDATE_POWER_PRICES } from './actions';
import { PowerPriceState } from '../types/tibber';

const initState: PowerPriceState = {};

export default function PowerPrices(
  state: PowerPriceState = initState,
  action: { type: string; data: PowerPriceState },
): PowerPriceState {
  switch (action.type) {
    case UPDATE_POWER_PRICES: {
      try {
        return { ...action.data };
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return initState;
      }
    }
    default:
      return state;
  }
}
