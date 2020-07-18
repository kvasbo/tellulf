import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import store from 'store';
import Solceller from './solceller/Solceller';
import firebase from './firebase';
import Kalender from './kalender/Kalender';
import Ruter from './ruter/Ruter';
import Klokke from './Klokke';
import Settings from './Settings';
import { updateNetatmo, updateNetatmoAverages } from './redux/actions';
import { NetatmoStore } from './redux/Netatmo';
import { fetchForecast } from './redux/actions';
import { TrainDataSet } from './types/trains';
import { AppStore } from './redux/reducers';
import './tellulf.css';
import { NetatmoAverageData } from './redux/NetatmoAverages';
import TibberUpdater from './tibberUpdater';
import SolarUpdater from './solarUpdater';

const steder = {
  oslo: { lat: 59.9409, long: 10.6991 },
  sandefjord: { lat: 59.1347, long: 10.325 },
};

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  dispatch: Function;
  loggedIn: boolean;
  trains: TrainDataSet;
  temperature: number;
  netatmo: NetatmoAverageData;
  updaters: { tibber: TibberUpdater; solar: SolarUpdater };
}

interface State {
  setupMode: boolean;
}

class Tellulf extends React.PureComponent<Props, State> {
  private interval = 0;

  private toggleMode: () => void;
  public constructor(props: Props) {
    super(props);
    this.state = { setupMode: false };
    this.toggleMode = (): void => {
      this.setState({ setupMode: !this.state.setupMode });
    };
  }

  public componentDidMount() {
    this.startReloadLoop();
    this.attachNetatmoListener();
    this.updateWeather();
    this.interval = window.setInterval(() => this.updateWeather(), 60 * 1000 * 15);
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  private attachNetatmoListener() {
    const dbRef = firebase.database().ref('netatmo/currentData');
    dbRef.on('value', (snapshot) => {
      if (snapshot) {
        const data: NetatmoStore = snapshot.val() as NetatmoStore;
        this.props.dispatch(updateNetatmo(data));
      }
    });
    const dbRefAvg = firebase.database().ref('netatmo/areaData');
    dbRefAvg.on('value', (snapshot) => {
      if (snapshot) {
        const data = snapshot.val();
        this.props.dispatch(updateNetatmoAverages(data));
      }
    });
  }

  private updateWeather() {
    try {
      // New
      this.props.dispatch(fetchForecast(steder.oslo.lat, steder.oslo.long, 'oslo'));
      this.props.dispatch(
        fetchForecast(steder.sandefjord.lat, steder.sandefjord.long, 'sandefjord'),
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  private startReloadLoop() {
    const now = Moment();
    const reload = Moment(now).startOf('hour').add(1, 'hour').add(5, 'seconds');
    const diff = reload.diff(now, 'milliseconds');
    setTimeout(() => {
      window.location.reload();
    }, diff);
  }

  public render() {
    const showEnergy = store.get('showEnergy', true);
    const showTrains = store.get('showTrains', true);

    return (
      <div className="grid">
        <div style={{ gridColumn: `1 / 1`, gridRow: '1 / 4', overflow: 'auto' }} className="block">
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
          <Klokke key="tellulf-klokke" temp={this.props.temperature} onClick={this.toggleMode} />
        </div>
        {this.state.setupMode && (
          <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3' }} className="block">
            <Settings />
          </div>
        )}
        {!this.state.setupMode && showEnergy && (
          <div style={{ gridColumn: '2 / 3', gridRow: '2 / 4' }} className="block">
            <Solceller key="tellulf-energi" updaters={this.props.updaters} />
          </div>
        )}
        {!this.state.setupMode && showTrains && (
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
        )}
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
