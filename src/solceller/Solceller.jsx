import React, { Component } from 'react';
import Moment from 'moment';
import { meanBy } from 'lodash';
import MainListItem from '../components/MainListItemFour';
import './style.css';

const minutesToKeep = 60;

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
    this.samples = this.samples.filter(s => s.time.isSameOrAfter(cutOff));
    const nowAveraged = Math.round(meanBy(this.samples, 'value'));
    this.setState({ nowAveraged });
  }

  showCurrent() {
    if (this.state.nowAveraged === null) { return 0; }
    const avg = Number(this.state.nowAveraged);
    if (avg < 1000) {
      return { val: avg.toFixed(0), unit: '' };
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

    return (
      <MainListItem mainItem={current.val} unit={current.unit} subItems={subs} />
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
