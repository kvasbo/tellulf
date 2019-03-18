import axios from "axios";
import Moment from "moment";

import { updatePowerPrices, updateInitStatus } from "./redux/actions";

const nettleie = 0.477;

export default class tibberUpdater {
  store: { dispatch: Function };
  constructor(store: { dispatch: Function }) {
    this.store = store;
  }
  async updatePowerPrices() {
    try {
      const data = await axios({
        url: "https://api.tibber.com/v1-beta/gql",
        method: "post",
        headers: {
          Authorization:
            "bearer 1a3772d944bcf972f1ee84cf45d769de1c80e4f0173d665328287d1e2a746004"
        },
        data: {
          query: `
            {viewer {homes {currentSubscription {priceInfo {today {total energy tax startsAt }}}}}}
            `
        }
      });
      if (data.status === 200) {
        const prices =
          data.data.data.viewer.homes[0].currentSubscription.priceInfo.today;
        const powerPrices = {};
        prices.forEach(p => {
          const h = Moment(p.startsAt).hours();
          powerPrices[h] = { total: p.total + nettleie };
        });
        this.store.dispatch(updatePowerPrices(powerPrices));
        this.store.dispatch(updateInitStatus("powerPrices"));
      }
    } catch (err) {
      console.log(err);
    }
  }
}
