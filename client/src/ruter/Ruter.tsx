import Moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { fetchTrains } from '../redux/actions';
import { GenericProps } from '../types/generic';
import { ExtendedTrainData, TrainData, TrainDataSet } from '../types/trains';
import Rute from './Rute';

interface Props {
  trains: TrainDataSet;
  // eslint-disable-next-line @typescript-eslint/ban-types
  dispatch: Function;
}

function parseTrain(data: TrainData): ExtendedTrainData {
  const now = Moment();
  const train: ExtendedTrainData = {
    ...data,
    fromNow: data.faktiskTid.diff(now, 's'),
    fromNowM: data.faktiskTid.diff(now, 'm'),
    ruteDiff: data.faktiskTid.diff(data.ruteTid, 'm'),
  };
  return train;
}

class Ruter extends React.PureComponent<Props, GenericProps> {
  private intervalId = 0;

  public componentDidMount = () => {
    window.setTimeout(() => this.updateTrains(), 5000);
    this.intervalId = window.setInterval(() => this.updateTrains(), 60000);
  };

  public componentWillUnmount = () => {
    window.clearInterval(this.intervalId);
  };

  private updateTrains() {
    this.props.dispatch(fetchTrains());
  }

  private getParsedTrains(limit = 9999999): ExtendedTrainData[] {
    let tog = [];
    const trains = Object.values(this.props.trains);
    tog = trains.map((t) => parseTrain(t));
    tog = tog
      .sort((a, b) => {
        return a.fromNow - b.fromNow;
      })
      .slice(0, limit);
    return tog;
  }

  public render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <Rute type="Bane" rutenummer="1" trains={this.getParsedTrains(10000)} />
        <Rute type="Buss" rutenummer="46" trains={this.getParsedTrains(10000)} />
      </div>
    );
  }
}

export default connect()(Ruter);
