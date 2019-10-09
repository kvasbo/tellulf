import { UPDATE_POWER_PRICES } from './actions';
import { PowerPriceState } from '../types/tibber';
import { Action } from 'redux';

const initState: PowerPriceState = {};

interface KnownAction {
  type: string;
  data: PowerPriceState;
}

export default function PowerPrices(
  state: PowerPriceState = initState,
  incomingAction: Action,
): PowerPriceState {
  const action = incomingAction as KnownAction;
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
