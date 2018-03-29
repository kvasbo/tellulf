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
    //  this._barEffect = this.initBarEffect();
    //  this._barProduction = this.initBarProduction();

    const dbRef = window.firebase.database().ref('steca/currentData');

    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();

        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
        const today = (typeof val.today.val !== 'undefined') ? val.today.val : null;
        const month = (typeof val.month.val !== 'undefined') ? val.month.val : null;
        const year = (typeof val.year.val !== 'undefined') ? val.year.val : null;
        const total = (typeof val.total.val !== 'undefined') ? val.total.val : null;

        // const wattage = val.effect.val / maxEver;
        // const percentOfMaxDay = val.today.val / maxDayEver;

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
    const str = (parseFloat(this.state.today) / 1000).toFixed(2);
    return str;
  }

  showProdMonth() {
    const str = (parseFloat(this.state.month) / 1000).toFixed(0);
    return str;
  }

  showProdYear() {
    const str = (parseFloat(this.state.year) / 1000).toFixed(0);
    return str;
  }

  showProdTotal() {
    const str = (parseFloat(this.state.total) / 1000).toFixed(0);
    return str;
  }

  render() {
    const subs = [
      `Dag: ${this.showProdToday()}`,
      `${getMonth()}: ${this.showProdMonth()}`,
      `${getYear()}: ${this.showProdYear()}`,
      `Tot: ${this.showProdTotal()}`,
    ];

    return (
      <MainListItem mainItem={this.showCurrent()} unit="W" subItems={subs} />
    );
  }
}

function getMonth() {
  const m = new Moment().format('MMM');
  return m.charAt(0).toUpperCase() + m.slice(1);
}

function getYear() {
  const m = new Moment().format('YYYY');
  return m.charAt(0).toUpperCase() + m.slice(1);
}
