import Moment from 'moment';
import firebase from './firebase';
import { updateSolarMax, updateSolarCurrent, updateInitStatus } from './redux/actions';
import { SolarCurrent } from './types/solar';

function parseByHour(data: []) {
  const startOfDay = Moment().startOf('day');

  const out = data.map((d: { minutesFromMidnight: number; production: number }) => {
    const time = Moment(startOfDay).add(d.minutesFromMidnight, 'minutes');
    return { time: time.valueOf(), production: d.production };
  });
  return out;
}

export default class SolarUpdater {
  private store: { dispatch: Function };

  public constructor(store: { dispatch: Function }) {
    this.store = store;
  }

  public async attachListeners() {
    firebase
      .database()
      .ref('steca/currentData')
      .on('value', (snapshot: firebase.database.DataSnapshot | null) => {
        try {
          if (snapshot === null) return;
          const val = snapshot.val();
          const dataTime =
            typeof val.averages.time !== 'undefined' ? Moment(val.averages.time) : Moment(0);
          const now = typeof val.effect.val !== 'undefined' ? val.effect.val : 0;
          const today = typeof val.today.val !== 'undefined' ? val.today.val : 0;
          const month = typeof val.month.val !== 'undefined' ? val.month.val : 0;
          const year = typeof val.year.val !== 'undefined' ? val.year.val : 0;
          const total = typeof val.total.val !== 'undefined' ? val.total.val : 0;
          const averageFull = typeof val.averages.full !== 'undefined' ? val.averages.full : 0;
          const averageMinute = typeof val.averages['1'] !== 'undefined' ? val.averages['1'] : 0;
          const byHour =
            typeof val.todayByHour.val !== 'undefined' ? parseByHour(val.todayByHour.val) : [];
          const currentTime = Moment();
          const state: SolarCurrent = {
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
          // eslint-disable-next-line no-console
          console.log(err);
        }
      });
  }

  /*
  Attach listeners to new max values
  */
  public async attachMaxListeners() {
    const now = Moment();
    const y = now.format('YYYY');
    const m = now.format('MM');
    const d = now.format('DD');
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = 'steca/maxValues/ever/';

    firebase
      .database()
      .ref(refDay)
      .on('value', (snapshot: firebase.database.DataSnapshot | null) => {
        if (snapshot === null) return;
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxDay: val.value };
          this.store.dispatch(updateSolarMax(state));
        }
      });

    firebase
      .database()
      .ref(refMonth)
      .on('value', (snapshot: firebase.database.DataSnapshot | null) => {
        if (snapshot === null) return;
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxMonth: val.value };
          this.store.dispatch(updateSolarMax(state));
        }
      });

    firebase
      .database()
      .ref(refYear)
      .on('value', (snapshot: firebase.database.DataSnapshot | null) => {
        if (snapshot === null) return;
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxYear: val.value };
          this.store.dispatch(updateSolarMax(state));
        }
      });

    firebase
      .database()
      .ref(refEver)
      .on('value', (snapshot: firebase.database.DataSnapshot | null) => {
        if (snapshot === null) return;
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxEver: val.value };
          this.store.dispatch(updateSolarMax(state));
        }
      });
  }
}
