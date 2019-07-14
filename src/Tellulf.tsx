import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import Solceller from './solceller/Solceller';
import firebase from './firebase';
// import Yr from './weather/Yr';
import Kalender from './kalender/Kalender';
import Ruter from './ruter/Ruter';
import Klokke from './Klokke';
import { updateNetatmo, updateNetatmoAverages } from './redux/actions';
import { NetatmoStore } from './redux/Netatmo';
import { fetchTrains, fetchWeather } from './redux/actions';
import { TrainDataSet } from './types/trains';
import { AppStore } from './redux/reducers';
import './tellulf.css';
import { NetatmoAverageData } from './redux/NetatmoAverages';
import TibberUpdater from './tibberUpdater';
import SolarUpdater from './solarUpdater';

// Todo: Flytte listeners ut i egen tråd!

const steder = {
  oslo: { lat: 59.9409, long: 10.6991 },
  sandefjord: { lat: 59.1347624, long: 10.3250789 },
};

interface Props {
  dispatch: Function;
  loggedIn: boolean;
  trains: TrainDataSet;
  temperature: number;
  netatmo: NetatmoAverageData;
  updaters: { tibber: TibberUpdater; solar: SolarUpdater };
}

class Tellulf extends React.PureComponent<Props, {}> {
  public componentDidMount() {
    this.startReloadLoop();
    this.attachNetatmoListener();
    setInterval(this.doLoadData, 1000);
    this.doLoadData(true);
    this.updateWeather();
    setInterval(() => this.updateWeather(), 60 * 1000 * 15);
  }

  private attachNetatmoListener() {
    const dbRef = firebase.database().ref('netatmo/currentData');
    dbRef.on('value', snapshot => {
      if (snapshot) {
        const data: NetatmoStore = snapshot.val() as NetatmoStore;
        this.props.dispatch(updateNetatmo(data));
      }
    });
    const dbRefAvg = firebase.database().ref('netatmo/areaData');
    dbRefAvg.on('value', snapshot => {
      if (snapshot) {
        const data = snapshot.val();
        this.props.dispatch(updateNetatmoAverages(data));
      }
    });
  }

  private updateWeather() {
    // const { lat, long } = steder[this.state.sted];
    try {
      this.props.dispatch(fetchWeather(steder.oslo.lat, steder.oslo.long, 'oslo'));
      this.props.dispatch(
        fetchWeather(steder.sandefjord.lat, steder.sandefjord.long, 'sandefjord'),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  private startReloadLoop() {
    const now = Moment();
    const reload = Moment(now)
      .startOf('hour')
      .add(1, 'hour');
    const diff = reload.diff(now, 'milliseconds');
    setTimeout(() => {
      window.location.reload();
    }, diff);
  }

  doLoadData = (force = false) => {
    const now = Moment();
    const sec = now.seconds();

    // Laste tog
    if (force || sec % 10 === 0) this.props.dispatch(fetchTrains());
  };

  public render() {
    return (
      <div className="grid">
        <div style={{ gridColumn: '1 / 1', gridRow: '1 / 4', overflow: 'auto' }} className="block">
          <Kalender key="tellulf-kalender" />
        </div>
        <div
          style={{
            gridColumn: '2 / 3',
            gridRow: '1 / 2',
            display: 'flex',
            justifyItems: 'space-evenly',
            alignContent: 'center',
          }}
          className="block"
        >
          <Klokke key="tellulf-klokke" temp={this.props.temperature} />
        </div>
        <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }} className="block">
          {this.props.loggedIn && <Solceller key="tellulf-energi" updaters={this.props.updaters} />}
        </div>
        <div
          style={{
            gridColumn: '2 / 3',
            gridRow: '3 / 4',
            justifyItems: 'space-evenly',
            alignContent: 'center',
          }}
          className="block"
        >
          <Ruter trains={this.props.trains} key="tellulf-trains" />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    trains: state.Trains,
    temperature: state.NetatmoAverages.temperature,
    netatmo: state.NetatmoAverages,
  };
}

export default connect(mapStateToProps)(Tellulf);
