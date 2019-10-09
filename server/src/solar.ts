import Moment, { tz } from 'moment-timezone';
import { Timber } from '@timberio/node';
import { meanBy } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Steca = require('stecagridscrape');

interface ProdData {
  val?: number;
  time?: string | null;
  error?: boolean;
}

interface ProdAverages extends ProdData {
  full: number;
  short: number;
}

// Keep track of average values
interface Averages {
  [s: string]: number;
}

interface Production {
  effect?: ProdData;
  today?: ProdData;
  month?: ProdData;
  year?: ProdData;
  total?: ProdData;
  averages?: ProdAverages;
  todayByHour?: {
    time: string | null;
    error: boolean;
    val: number[];
  };
}

interface Sample {
  value: number;
  time: Moment.Moment;
}

class StecaParser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mySteca: any;
  private firebase: firebase.app.App;
  private samples: Sample[];
  private logger: Timber;

  constructor(ip: string, firebase: firebase.app.App, logger: Timber) {
    this.firebase = firebase;
    this.mySteca = new Steca(ip);
    this.samples = [];
    this.logger = logger;
  }

  async updateData(full = false) {
    const now = tz(undefined, 'Europe/Oslo');
    const dst = now.isDST();
    const production: Production = {};
    production.effect = { val: 0, time: null, error: false };
    production.today = { val: 0, time: null, error: false };

    try {
      production.effect.time = new Date().toUTCString();
      const effect = await this.mySteca.getEffect();
      production.effect.val = effect;
      this.checkMax(effect, now);
      const averages = this.addPowerSampleAndPrune(effect);
      production.averages = {
        time: new Date().toUTCString(),
        full: averages['60'],
        short: averages['15'],
        ...averages,
      };
    } catch (err) {
      production.effect.error = true;
      this.logger.error(err.message);
    }

    try {
      production.today.time = new Date().toUTCString();
      const today = await this.mySteca.getProductionToday();
      production.today.val = today;
    } catch (err) {
      production.today.error = true;
      this.logger.error(err.message);
    }

    const doFull = now.second() < 10 || full;

    if (doFull) {
      production.month = { val: 0, time: null, error: false };
      production.year = { val: 0, time: null, error: false };
      production.total = { val: 0, time: null, error: false };
      production.todayByHour = { val: [], time: null, error: false };

      try {
        production.month.time = new Date().toUTCString();
        const month = await this.mySteca.getProductionThisMonth();
        production.month.val = month;
      } catch (err) {
        production.month.error = true;
        this.logger.error(err.message);
      }

      try {
        production.year.time = new Date().toUTCString();
        const year = await this.mySteca.getProductionThisYear();
        production.year.val = year;
      } catch (err) {
        production.year.error = true;
        this.logger.error(err.message);
      }

      try {
        production.total.time = new Date().toUTCString();
        const total = await this.mySteca.getProductionTotal();
        production.total.val = total;
      } catch (err) {
        production.total.error = true;
        this.logger.error(err.message);
      }

      try {
        if (production.todayByHour) {
          production.todayByHour.time = new Date().toUTCString();
          const byHour = await this.mySteca.getProductionTodayByHour();
          production.todayByHour.val = [...byHour];
        }
      } catch (err) {
        production.total.error = true;
        this.logger.error(err.message);
      }
    }

    this.logger.info(
      `Solar Oslo ${new Date().toUTCString()} ${
        production.effect.val
      }W. Full: ${doFull}. DST: ${dst}`,
    );

    try {
      // Update current data
      this.firebase
        .database()
        .ref('steca/currentData')
        .update(production);
    } catch (err) {
      this.logger.error(err.message);
    }
  }

  async checkMax(value: number, now: Moment.Moment) {
    const y = now.format('YYYY');
    const m = now.format('MM');
    const d = now.format('DD');
    const h = now.format('HH');
    const w = now.isoWeek();
    const refHour = `steca/maxValues/hourly/${y}/${m}/${d}/${h}`;
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = `steca/maxValues/ever/`;
    const refMonthOfYear = `steca/maxValues/stat/month/${m}/`;
    const refWeekOfYear = `steca/maxValues/stat/week/${w}/`;
    const refHourOfDay = `steca/maxValues/stat/hour/${h}/`;

    // Statistical - "max ever in any january"
    const monthOfYearSnap = await this.firebase
      .database()
      .ref(refMonthOfYear)
      .once('value');
    const monthOfYearData = monthOfYearSnap.val();
    if (!monthOfYearData || value > monthOfYearData.value) {
      await this.firebase
        .database()
        .ref(refMonthOfYear)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Month of year max set, ${refMonthOfYear}, ${now.toISOString()}, ${value}`);
    }

    // Statistical - "max ever in any week of this number"
    const weekOfYearSnap = await this.firebase
      .database()
      .ref(refWeekOfYear)
      .once('value');
    const weekOfYearData = weekOfYearSnap.val();
    if (!weekOfYearData || value > weekOfYearData.value) {
      await this.firebase
        .database()
        .ref(refWeekOfYear)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Week of year max set, ${refWeekOfYear}, ${now.toISOString()}, ${value}`);
    }

    // Stastistical - "max ever between 12 and 13"
    const hourOfDaySnap = await this.firebase
      .database()
      .ref(refHourOfDay)
      .once('value');
    const hourOfDayData = hourOfDaySnap.val();
    if (!hourOfDayData || value > hourOfDayData.value) {
      await this.firebase
        .database()
        .ref(refHourOfDay)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Hour of day max set, ${refHourOfDay}, ${now.toISOString()}, ${value}`);
    }

    const hourSnap = await this.firebase
      .database()
      .ref(refHour)
      .once('value');
    const hourData = hourSnap.val();
    if (!hourData || value > hourData.value) {
      await this.firebase
        .database()
        .ref(refHour)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Hour max set, ${refHour}, ${now.toISOString()}, ${value}`);
    } else {
      return; // No point in continuing, we have a larger value this hour.
    }

    // Max per day
    const daySnap = await this.firebase
      .database()
      .ref(refDay)
      .once('value');
    const dayData = daySnap.val();
    if (!dayData || value > dayData.value) {
      await this.firebase
        .database()
        .ref(refDay)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Daily max set, ${refDay}, ${now.toISOString()}, ${value}`);
    } else {
      return; // No point in continuing, we have a larger value this day.
    }

    // Max per month
    const monthSnap = await this.firebase
      .database()
      .ref(refMonth)
      .once('value');
    const monthData = monthSnap.val();
    if (!monthData || value > monthData.value) {
      await this.firebase
        .database()
        .ref(refMonth)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Monthly max set, ${refMonth}, ${now.toISOString()}, ${value}`);
    } else {
      return; // No point in continuing, we have a larger value this month.
    }

    const yearSnap = await this.firebase
      .database()
      .ref(refYear)
      .once('value');
    const yearData = yearSnap.val();
    if (!yearData || value > yearData.value) {
      await this.firebase
        .database()
        .ref(refYear)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Year max set, ${refYear}, ${now.toISOString()}, ${value}`);
    } else {
      return; // No point in continuing, we have a larger value this year.
    }

    // Max evah
    const everSnap = await this.firebase
      .database()
      .ref(refEver)
      .once('value');
    const everData = everSnap.val();
    if (!everData || value > everData.value) {
      await this.firebase
        .database()
        .ref(refEver)
        .set({ value, time: now.toISOString() });
      this.logger.info(`Ever max set, ${refEver}, ${now.toISOString()}, ${value}`);
    }

    this.logger.info('Max ran all the way through. Expensive!');
  }

  getFilteredSamples(minutes: number) {
    const cut = Moment().subtract(minutes, 'minutes');
    const tempSamples = this.samples.filter(s => s.time.isSameOrAfter(cut));
    return tempSamples;
  }

  getAverageForPeriod(minutes: number): number {
    const data = this.getFilteredSamples(minutes);
    const avg = Math.round(meanBy(data, 'value'));
    return avg;
  }

  addPowerSampleAndPrune(value: number) {
    // Add and prune
    this.samples.push({ value, time: Moment() });
    const cutOff = Moment().subtract(120, 'minutes');
    this.samples = this.samples.filter(s => s.time.isSameOrAfter(cutOff));

    const averages: Averages = {};
    averages['1'] = this.getAverageForPeriod(1);
    averages['5'] = this.getAverageForPeriod(5);
    averages['10'] = this.getAverageForPeriod(10);
    averages['15'] = this.getAverageForPeriod(15);
    averages['30'] = this.getAverageForPeriod(30);
    averages['60'] = this.getAverageForPeriod(60);
    averages['90'] = this.getAverageForPeriod(90);
    averages['120'] = this.getAverageForPeriod(120);

    return averages;
  }

  start(interval: number) {
    this.updateData(true);
    setInterval(() => this.updateData(), interval);
  }
}

export default StecaParser;
