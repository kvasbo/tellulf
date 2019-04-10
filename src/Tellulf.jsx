import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import Kalender from './kalender/Kalender.jsx';
import Ruter from './ruter/Ruter';
import Netatmo from './Netatmo.tsx';
import Klokke from './Klokke.tsx';
import { fetchTrains } from './redux/actions.ts';
import './tellulf.css';

function startReloadLoop() {
  const now = new Moment();
  const reload = Moment(now).startOf('hour').add(1, 'hour');
  const diff = reload.diff(now, 'milliseconds');
  window.reloadTimer = setTimeout(() => {
    window.location.reload();
  }, diff);
}

// Todo: Flytte listeners ut i egen tråd!

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
          <Klokke />
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }} className="block">
          {this.props.loggedIn && <Solceller />}
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '4 / 5' }} className="block">
          <Yr />
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '5 / 5' }} className="block">
          <Ruter trains={this.props.trains} />
        </div>
        <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }} className="block">
          <Netatmo />
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '1 / 4', overflow: 'auto' }} className="block">
          <Kalender />
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
