import React, { Component } from 'react';
import MainListItem from '../components/MainListItem';
import MainListItemFour from '../components/MainListItemFour';

export default class Netatmo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      temp: null,
      co2: null,
      inneTemp: null,
      fukt: null,
      trykk: null,
    };
  }

  componentDidMount() {
    console.log('Netatmo mounted');
    const dbRef = window.firebase.database().ref('netatmo/currentData');

    dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      // console.log("netatmo", data)

      const updated = new Date(data.updated);

      try {
        const temp = (typeof data.uteTemp !== 'undefined') ? data.uteTemp.toFixed(1) : null;
        const inneTemp = (typeof data.inneTemp !== 'undefined') ? Math.round(data.inneTemp) : null;
        const co2 = (typeof data.co2 !== 'undefined') ? Math.round(data.co2) : null;
        const fukt = (typeof data.inneFukt !== 'undefined') ? Math.round(data.inneFukt) : null;
        const trykk = (typeof data.inneTrykk !== 'undefined') ? Math.round(data.inneTrykk) : null;

        this.setState({
          temp, inneTemp, co2, fukt, updated, trykk,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  render() {
    const now = new Date();
    const ageInMinutes = (now - this.state.updated) / 60 / 1000;

    if (ageInMinutes > 60) {
      return (
        <MainListItem mainItem="?" subItems={[]} />
      );
    }

    const subs = [
      `${this.state.inneTemp}°`,
      `${this.state.co2} ppm`,
      `${this.state.fukt}%`,
      `${this.state.trykk} mb`,
    ];

    return (
      <MainListItemFour mainItem={this.state.temp} unit="°" subItems={subs} />
    );
  }
}
