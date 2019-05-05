import axios from 'axios';
import Moment from 'moment';
import firebase from './firebase';
import { updateSolarMax, updateSolarCurrent, updateInitStatus } from './redux/actions';

export default class solarUpdater {
  store: { dispatch: Function };

  constructor(store: { dispatch: Function }) {
    this.store = store;
  }

  async attachListeners() {
    const dbRef = firebase.database().ref('steca/currentData');

    dbRef.on('value', (snapshot: any) => {
      try {
        const val = snapshot.val();
        const dataTime = typeof val.averages.time !== 'undefined' ? Moment(val.averages.time) : null;
        const now = typeof val.effect.val !== 'undefined' ? val.effect.val : null;
        const today = typeof val.today.val !== 'undefined' ? val.today.val : null;
        const month = typeof val.month.val !== 'undefined' ? val.month.val : null;
        const year = typeof val.year.val !== 'undefined' ? val.year.val : null;
        const total = typeof val.total.val !== 'undefined' ? val.total.val : null;
        const averageFull = typeof val.averages.full !== 'undefined' ? val.averages.full : null;
        const averageMinute = typeof val.averages['1'] !== 'undefined' ? val.averages['1'] : null;
        const byHour = typeof val.todayByHour.val !== 'undefined' ? parseByHour(val.todayByHour.val) : null;
        const currentTime = Moment();
        const state = {
          now,
          today,
          month,
          year,
          total,
          byHour,
          currentTime,
          averageFull,
          averageMinute,
          dataTime,
        };
        this.store.dispatch(updateSolarCurrent(state));
        this.store.dispatch(updateInitStatus('solar'));
      } catch (err) {
        console.log(err);
      }
    });
  }

  /*
  Attach listeners to new max values
  */
  async attachMaxListeners() {
    const now = Moment();
    const y = now.format('YYYY');
    const m = now.format('MM');
    const d = now.format('DD');
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = 'steca/maxValues/ever/';

    const dbRefDayMax = firebase.database().ref(refDay);
    dbRefDayMax.on('value', (snapshot: any) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxDay: val.value };
        this.store.dispatch(updateSolarMax(state));
      }
    });

    const dbRefMonthMax = firebase.database().ref(refMonth);
    dbRefMonthMax.on('value', (snapshot: any) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxMonth: val.value };
        this.store.dispatch(updateSolarMax(state));
      }
    });

    const dbRefYearMax = firebase.database().ref(refYear);
    dbRefYearMax.on('value', (snapshot: any) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxYear: val.value };
        this.store.dispatch(updateSolarMax(state));
      }
    });

    const dbRefEverMax = firebase.database().ref(refEver);
    dbRefEverMax.on('value', (snapshot: any) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxEver: val.value };
        this.store.dispatch(updateSolarMax(state));
      }
    });
  }
}

function parseByHour(data: []) {
  const startOfDay = Moment().startOf('day');

  const out = data.map((d: { minutesFromMidnight: number; production: number }) => {
    const time = Moment(startOfDay).add(d.minutesFromMidnight, 'minutes');
    return { time: time.valueOf(), production: d.production };
  });
  return out;
}
