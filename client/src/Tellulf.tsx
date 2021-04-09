import Moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { TibberSettings } from './App';
import Kalender from './kalender/Kalender';
import Klokke from './Klokke';
import { updateNowcast, fetchYr } from './redux/actions';
import { AppStore } from './redux/reducers';
import Ruter from './ruter/Ruter';
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
  public constructor(props: Props) {
    super(props);
    this.state = { setupMode: false };
  }

  public componentDidMount() {
    this.startReloadLoop();
    this.updateWeather();
    this.interval = window.setInterval(() => this.updateWeather(), 60 * 1000 * 15);
    this.props.updaters.tibber.subscribeToRealTime();
    this.props.updaters.tibber.updatePowerPrices();
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  private async updateWeather() {
    try {
      // With raw data
      this.props.dispatch(fetchYr(steder.oslo.lat, steder.oslo.long, 'oslo'));
      this.props.dispatch(fetchYr(steder.sandefjord.lat, steder.sandefjord.long, 'sandefjord'));

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
    return (
      <div className="grid">
        <div className="block gridCalendar">
          <Kalender key="tellulf-kalender" />
        </div>
        <div className="block gridClock">
          <Klokke />
          <div className="gridNetatmoTemp">{this.props.temperature}&deg;</div>
        </div>
        <div className="block gridEnergy">
          <Solceller key="tellulf-energi" />
        </div>
        <div className="block gridTrains">
          <Ruter trains={this.props.trains} key="tellulf-trains" />
        </div>
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
