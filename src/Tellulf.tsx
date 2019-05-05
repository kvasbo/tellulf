import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Moment from 'moment';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import Kalender from './kalender/Kalender';
import Ruter from './ruter/Ruter';
import Netatmo from './Netatmo';
import Klokke from './Klokke';
import { fetchTrains } from './redux/actions';
import { AppStore } from './redux/reducers';
import './tellulf.css';

// Todo: Flytte listeners ut i egen tråd!

interface props {
  dispatch: Function;
  loggedIn: boolean;
  trains: object;
}

class Tellulf extends React.PureComponent<props, any> {
  constructor(props: props) {
    super(props);
    this.doLoadData = this.doLoadData.bind(this);
  }

  componentDidMount() {
    this.startReloadLoop();
    setInterval(this.doLoadData, 1000);
    this.doLoadData(true);
  }

  startReloadLoop() {
    const now = Moment();
    const reload = Moment(now).startOf('hour').add(1, 'hour');
    const diff = reload.diff(now, 'milliseconds');
    setTimeout(() => {
      window.location.reload();
    }, diff);
  }

  doLoadData(force = false) {
    const now = Moment();
    const sec = now.seconds();

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

function mapStateToProps(state: AppStore) {
  return {
    trains: state.Trains,
  };
}

export default connect(mapStateToProps)(Tellulf);
