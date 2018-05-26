import React, { Component } from 'react';
import Moment from 'moment';
import Modal from 'react-responsive-modal';
import ErrorBoundary from './ErrorBoundary';
import Klokke from './klokke/Klokke';
import Netatmo from './netatmo/Netatmo';
import Kalender from './kalender/Kalender';
import Ruter from './ruter/Ruter';
import Smarthus from './smarthus/Smarthus';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import './cssReset.css';
import './tellulf.css';

function startReloadLoop() {
  const now = new Moment();
  const reload = Moment(now).startOf('hour').add(1, 'hour');
  const diff = reload.diff(now, 'milliseconds');
  console.log('Reload at', reload.toLocaleString());
  window.reloadTimer = setTimeout(() => {
    window.location.reload();
  }, diff);
}

class Tellulf extends Component {
  constructor(props) {
    super(props);
    this.state = { modalBlinds: false };
  }

  componentDidMount() {
    startReloadLoop();
  }

  render() {
    return (
      <div className="gridContainer">
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 1, gridRowEnd: 2 }}>
          <ErrorBoundary><Klokke /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 2, gridRowEnd: 3 }} className="block">
          <ErrorBoundary><Netatmo /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 3, gridRowEnd: 4 }} className="block">
          <ErrorBoundary><Solceller /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 4, gridRowEnd: 5 }} className="block">
          <ErrorBoundary><Yr /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 4, gridColumnEnd: 5, gridRowStart: 1, gridRowEnd: 5 }} className="block">
          <ErrorBoundary><Kalender /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 1, gridColumnEnd: 4, gridRowStart: 5, gridRowEnd: 6 }} className="block">
          <ErrorBoundary><Ruter stasjon="3012315" retning="1 (Retning sentrum)" /></ErrorBoundary>
        </div>
        <div style={{ gridColumnStart: 4, gridColumnEnd: 5, gridRowStart: 5, gridRowEnd: 6 }} className="block">
          <ErrorBoundary><Smarthus /></ErrorBoundary>
        </div>
      </div>
    );
  }
}

/*

<div style={{ gridColumnStart: 3, gridColumnEnd: 4, gridRowStart: 5, gridRowEnd: 6 }} className="block">
          <ErrorBoundary><Smarthus /></ErrorBoundary>
        </div>

        */

export default Tellulf;
