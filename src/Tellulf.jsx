import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import ErrorBoundary from './ErrorBoundary';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import Kalender from './kalender/Kalender';
import Ruter from './ruter/Ruter';
import Netatmo from './Netatmo.tsx';
import Klokke from './Klokke.tsx';
import { fetchTrains } from './redux/actions';
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
  constructor(props) {
    super(props);
    this.doLoadData = this.doLoadData.bind(this);
  }

  componentDidMount() {
    startReloadLoop();
    setInterval(this.doLoadData, 1000);
    this.doLoadData(true);
  }

  doLoadData(force = false) {
    const now = Moment();
    const sec = now.seconds();
    // console.log('loadData', sec);

    // Laste tog
    if (force || sec % 10 === 0) this.props.dispatch(fetchTrains('3012315', '1 (Retning sentrum)'));
  }

  render() {
    return (
      <div className="grid">
        <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2' }} className="block">
          <ErrorBoundary><Klokke /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }} className="block">
          {this.props.loggedIn && <ErrorBoundary><Solceller /></ErrorBoundary>}
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '4 / 5' }} className="block">
          <ErrorBoundary><Yr /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '5 / 5' }} className="block">
          <ErrorBoundary><Ruter trains={this.props.trains} /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }} className="block">
          <ErrorBoundary><Netatmo /></ErrorBoundary>
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 5' }} className="block">
          <ErrorBoundary><Kalender /></ErrorBoundary>
        </div>
      </div>
    );
  }
}

Tellulf.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  trains: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    trains: state.Trains,
  };
}

export default connect(mapStateToProps)(Tellulf);
