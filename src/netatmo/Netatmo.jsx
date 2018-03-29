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
    };
  }

  componentDidMount() {
    console.log('Netatmo mounted');
    const dbRef = window.firebase.database().ref('netatmo/currentData');

    dbRef.on('value', (snapshot) => {
      const updated = new Date(snapshot.val().updated);

      try {
        const temp = (typeof snapshot.val().uteTemp !== 'undefined') ? snapshot.val().uteTemp.toFixed(1) : null;
        const inneTemp = (typeof snapshot.val().inneTemp !== 'undefined') ? Math.round(snapshot.val().inneTemp) : null;
        const co2 = (typeof snapshot.val().co2 !== 'undefined') ? Math.round(snapshot.val().co2) : null;
        const fukt = (typeof snapshot.val().inneFukt !== 'undefined') ? Math.round(snapshot.val().inneFukt) : null;

        this.setState({
          temp, inneTemp, co2, fukt, updated,
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
    ];

    return (
      <MainListItemFour mainItem={this.state.temp} unit="°" subItems={subs} />
    );
  }
}
