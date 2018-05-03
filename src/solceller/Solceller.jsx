import React, { Component } from 'react';
import Moment from 'moment';
import { meanBy } from 'lodash';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
import MainListItem from '../components/MainListItemFour';
import './style.css';

const minutesToKeep = 60;
const minutesToUseForTendency = 15;

export default class Solceller extends Component {
  constructor(props) {
    super(props);
    this.samples = [];
    this.state = {
      now: null,
      today: null,
      month: null,
      year: null,
      total: null,
      nowAveraged: null,
      tendencyAveraged: null,
      byHour: null,
      hasPruned: false,
    };
  }

  componentDidMount() {
    const dbRef = window.firebase.database().ref('steca/currentData');

    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();
        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
        if (now) this.addPowerSampleAndPrune(now);
        const today = (typeof val.today.val !== 'undefined') ? val.today.val : null;
        const month = (typeof val.month.val !== 'undefined') ? val.month.val : null;
        const year = (typeof val.year.val !== 'undefined') ? val.year.val : null;
        const total = (typeof val.total.val !== 'undefined') ? val.total.val : null;
        const byHour = (typeof val.todayByHour.val !== 'undefined') ? this.parseByHour(val.todayByHour.val) : null;
        this.setState({
          now, today, month, year, total, byHour,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  parseByHour(data) {
    const startOfDay = Moment().startOf('day');
    // console.log('parseByHour', data, startOfDay);

    const out = data.map((d) => {
      const time = Moment(startOfDay).add(d.minutesFromMidnight, 'minutes');
      return { time: time.toDate(), production: d.production }
    });

    console.log('parsed', out);

    return out;
  }

  addPowerSampleAndPrune(value) {
    this.samples.push({ value, time: Moment() });
    const cutOff = Moment().subtract(minutesToKeep, 'minutes');
    const devCutOff = Moment().subtract(minutesToUseForTendency, 'minutes');
    const tempSamples = this.samples.filter(s => s.time.isSameOrAfter(cutOff));
    if (!this.hasPruned && tempSamples.length < this.samples.length) {
      this.setState({ hasPruned: true });
    }
    this.samples = tempSamples;
    const devSamples = this.samples.filter(s => s.time.isSameOrAfter(devCutOff));
    const nowAveraged = Math.round(meanBy(this.samples, 'value'));
    const tendencyAveraged = Math.round(meanBy(devSamples, 'value'));
    // console.log(nowAveraged, tendencyAveraged);
    this.setState({ nowAveraged, tendencyAveraged });
  }

  showCurrent() {
    if (this.state.nowAveraged === null) return { val: 0, unit: 'W' };
    const avg = Number(this.state.nowAveraged);
    if (avg < 1000) {
      return { val: avg.toFixed(0), unit: 'W' };
    }
    const rounded = (avg / 1000).toFixed(1);
    return { val: rounded, unit: 'K' };
  }

  showInstant() {
    return `${Number(this.state.now)}W`;
  }

  showProdToday() {
    return getRoundedNumber(Number(this.state.today) / 1000);
  }

  showProdMonth() {
    return getRoundedNumber(parseFloat(this.state.month) / 1000);
  }

  showProdYear() {
    return getRoundedNumber(parseFloat(this.state.year) / 1000);
  }

  showProdTotal() {
    return getRoundedNumber(parseFloat(this.state.total) / 1000);
  }

  formatTick(data) {
    console.log('ftick', data);
    const time = Moment(data);
    return time.format("HH");
  }

  render() {
    const current = this.showCurrent();
    const subs = [
      `D: ${this.showProdToday()}`,
      `M: ${this.showProdMonth()}`,
      `Å: ${this.showProdYear()}`,
      `!: ${this.showInstant()}`,
    ];

    const pruneIndicator = (this.state.hasPruned) ? '' : '*';
    const mainItem = `${current.val}`;
    const unit = `${pruneIndicator}${current.unit}`;

    return (
      <div>
        <div>
          <MainListItem mainItem={mainItem} unit={unit} subItems={subs} />
        </div>
        <div>
          <LineChart margin={{ top: 10, right: 10, left: 30, bottom: 10 }} width={500} height={150} data={this.state.byHour}>
            <XAxis dataKey="time" />
            <YAxis type="number" domain={[0, 4000]} />
            <Line dot={false} type="monotone" dataKey="production" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>
    );
  }
}

function getRoundedNumber(number) {
  if (number < 10) {
    return number.toFixed(3);
  } else if (number < 100) {
    return number.toFixed(2);
  } else if (number < 1000) {
    return number.toFixed(1);
  }
  return number.toFixed(0);
}
