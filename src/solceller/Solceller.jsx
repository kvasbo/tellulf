import React, { Component } from 'react';
import Moment from 'moment';
import MainListItem from '../components/MainListItemFour';
import './style.css';

// const maxEver = 4254;
// const maxDayEver = 28900;

export default class Solceller extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: null,
      today: null,
      month: null,
      year: null,
      total: null,
    };
  }

  componentDidMount() {
    const dbRef = window.firebase.database().ref('steca/currentData');

    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();
        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
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

  showCurrent() {
    if (this.state.now === null) { return 0; }
    const str = this.state.now;
    return str;
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
    const subs = [
      `D: ${this.showProdToday()}`,
      `M: ${this.showProdMonth()}`,
      `Å: ${this.showProdYear()}`,
      `∞: ${this.showProdTotal()}`,
    ];

    return (
      <MainListItem mainItem={this.showCurrent()} unit="W" subItems={subs} />
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
