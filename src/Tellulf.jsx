import React from 'react';
import Moment from 'moment';
import ErrorBoundary from './ErrorBoundary';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
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
      <div className="gridContainer" style={{ flexDirection: 'column' }}>
        <div style={{ flex: 1.15 }} className="block">
          {this.props.loggedIn && <ErrorBoundary><Solceller /></ErrorBoundary>}
        </div>
        <div style={{ flex: 1 }} className="block">
          <ErrorBoundary><Yr /></ErrorBoundary>
        </div>
      </div>
    );
  }
}

export default Tellulf;
