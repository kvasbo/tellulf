import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import Tog from './Tog';
import './flat.css';

export default class Ruter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tog: [],
    };

    this.oppdateringsFrekvens = 10;
  }

  componentDidMount() {
    console.log('Ruter mounted');

    setInterval(() => {
      this.getRuterData();
    }, 1000 * this.oppdateringsFrekvens);

    this.getRuterData();
  }

  getTrains(data) {
    const tog = [];

    // Loop backwards
    for (let i = data.length - 1; i > -1; i -= 1) {
      const t = getTrain(data[i]);

      tog.push(t);
    }

    this.setState({ tog });
  }

  getTrainObjects() {
    const out = [];

    for (let i = 0; i < this.state.tog.length; i += 1) {
      out.push(<Tog key={this.state.tog[i].id} info={this.state.tog[i]} />);
    }

    return out;
  }

  async getRuterData() {
    const url = `https://reisapi.ruter.no/StopVisit/GetDepartures/${this.props.stasjon}?json=true`;
    const now = new Date();

    const data = await fetch(url);
    const jsonData = await data.json();

    const trainData = [];

    jsonData.forEach((t) => {
      if (t.MonitoredVehicleJourney.MonitoredCall.DeparturePlatformName === this.props.retning) {
        const d = t.MonitoredVehicleJourney.MonitoredCall;
        const out = {};
        out.ruteTid = new Date(d.AimedArrivalTime);
        out.faktiskTid = new Date(d.ExpectedArrivalTime);
        // out.diffRute = Math.floor((out.faktiskTid - out.ruteTid) / 1000);
        // out.diffNow = Math.floor((out.faktiskTid - now) / 1000);
        // eslint-disable-next-line max-len
        out.id = `${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DataFrameRef}_${t.MonitoredVehicleJourney.FramedVehicleJourneyRef.DatedVehicleJourneyRef}`;
        out.linje = t.MonitoredVehicleJourney.PublishedLineName;
        out.Endestasjon = t.MonitoredVehicleJourney.DestinationName;
        trainData.push(out);
      }
    });

    this.getTrains(trainData);
  }


  render() {
    return (
      <div className="" id="RuterFlat">{this.getTrainObjects()}</div>
    );
  }
}

function getTrain(data) {
  const train = {};
  const now = new Moment();

  train.id = data.id;
  train.faktiskTid = new Moment(data.faktiskTid);
  train.ruteTid = new Moment(data.ruteTid);
  train.goingTo = data.Endestasjon;
  train.linje = data.linje;
  train.fromNow = train.faktiskTid.diff(now, 's');
  train.fromNowM = train.faktiskTid.diff(now, 'm');
  train.ruteDiff = train.faktiskTid.diff(train.ruteTid, 'm');

  return train;
}

Ruter.propTypes = {
  stasjon: PropTypes.string.isRequired,
  retning: PropTypes.string.isRequired,
};
