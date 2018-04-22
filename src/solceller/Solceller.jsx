import React, { Component } from 'react';
import Moment from 'moment';
import { meanBy } from 'lodash';
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
        this.setState({
          now, today, month, year, total,
        });
      } catch (err) {
        console.log(err);
      }
    });
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
      <MainListItem mainItem={mainItem} unit={unit} subItems={subs} />
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
