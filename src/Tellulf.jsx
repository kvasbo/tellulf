import React from 'react';
import Moment from 'moment';
import ErrorBoundary from './ErrorBoundary';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import Ruter from './ruter/Ruter';
import Netatmo from './Netatmo';
import './cssReset.css';
import './tellulf.css';

function startReloadLoop() {
  const now = new Moment();
  const reload = Moment(now).startOf('hour').add(1, 'hour');
  const diff = reload.diff(now, 'milliseconds');
  window.reloadTimer = setTimeout(() => {
    window.location.reload();
  }, diff);
}
class Tellulf extends React.PureComponent {
  componentDidMount() {
    startReloadLoop();
  }

  render() {
    return (
      <div className="grid">
        <div style={{ gridColumn: '1 / 1', gridRow: '3 / 4' }} className="block">
          {this.props.loggedIn && <ErrorBoundary><Solceller /></ErrorBoundary>}
        </div>
        <div style={{ gridColumn: '1 / 1', gridRow: '4 / 5' }} className="block">
          <ErrorBoundary><Yr /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '5 / 5' }} className="block">
          <ErrorBoundary><Ruter stasjon="3012315" retning="1 (Retning sentrum)" /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '1 / 1', gridRow: '2 / 3' }} className="block">
          <ErrorBoundary><Netatmo /></ErrorBoundary>
        </div>
      </div>
    );
  }
}

export default Tellulf;
