import Moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import store from 'store';
import { TibberSettings } from './App';
import Kalender from './kalender/Kalender';
import Klokke from './Klokke';
import { fetchForecast, updateNowcast } from './redux/actions';
import { AppStore } from './redux/reducers';
import Ruter from './ruter/Ruter';
import Settings from './Settings';
import Solceller from './solceller/Solceller';
import TibberUpdater from './tibberUpdater';
import { TrainDataSet } from './types/trains';
import { getNowCast } from './weather/updateWeather';

const steder = {
  oslo: { lat: 59.9508, long: 10.6852 },
  sandefjord: { lat: 59.1347, long: 10.325 },
};

interface Props {
  // eslint-disable-next-line @typescript-eslint/ban-types
  dispatch: Function;
  trains: TrainDataSet;
  temperature: number;
  updaters: { tibber: TibberUpdater };
  tibberSettings: TibberSettings;
}

interface State {
  setupMode: boolean;
}

class Tellulf extends React.PureComponent<Props, State> {
  private interval = 0;
  private width = 0;

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
    this.updateWeather();
    this.width = window.innerWidth;
    this.interval = window.setInterval(() => this.updateWeather(), 60 * 1000 * 15);
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  private async updateWeather() {
    try {
      // New
      this.props.dispatch(fetchForecast(steder.oslo.lat, steder.oslo.long, 'oslo'));
      this.props.dispatch(
        fetchForecast(steder.sandefjord.lat, steder.sandefjord.long, 'sandefjord'),
      );

      // Hack: Get current temp
      const nowCast = await getNowCast(steder.oslo.lat, steder.oslo.long);
      if (nowCast.temp) {
        this.props.dispatch(updateNowcast(nowCast.temp));
      }
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

  public render(): React.ReactNode {
    const showEnergySetting = store.get('showEnergy', true);
    const showTrainsSetting = store.get('showTrains', true);

    const showEnergy = this.width > 600 && showEnergySetting;
    const showTrains = this.width > 600 && showTrainsSetting;

    return (
      <div className="grid">
        <div className="block gridCalendar">
          <Kalender key="tellulf-kalender" />
        </div>
        <div className="block gridClock">
          <Klokke onClick={this.toggleMode} />
          <div className="gridNetatmoTemp">{this.props.temperature}&deg;</div>
        </div>
        {showEnergy && (
          <div className="block gridEnergy">
            <Solceller key="tellulf-energi" updaters={this.props.updaters} />
          </div>
        )}
        {showTrains && (
          <div className="block gridTrains">
            <Ruter trains={this.props.trains} key="tellulf-trains" />
          </div>
        )}
        {this.state.setupMode && (
          <div className="block gridSettings">
            <Settings />
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    trains: state.Trains,
    temperature: state.Nowcast.temp,
  };
}

export default connect(mapStateToProps)(Tellulf);
