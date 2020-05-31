import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import { TrainDataSet, TrainData, ExtendedTrainData } from '../types/trains';
import { GenericProps } from '../types/generic';

import { fetchTrains } from '../redux/actions';
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
    this.updateTrains();
    this.intervalId = window.setInterval(() => this.updateTrains(), 15000);
  };

  public componentWillUnmount = () => {
    window.clearInterval(this.intervalId);
  };

  private updateTrains() {
    this.props.dispatch(fetchTrains());
  }

  private getTrainList() {
    let tog = [];
    const trains = Object.values(this.props.trains);
    for (let i = trains.length - 1; i > -1; i -= 1) {
      const t = parseTrain(trains[i]);
      tog.push(t);
    }

    tog = tog
      .sort((a, b) => {
        return a.fromNow - b.fromNow;
      })
      .slice(0, 5);

    const out = [];
    for (let i = 0; i < tog.length; i += 1) {
      const fontSize = i === 0 ? 18 : 14;
      out.push(
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontSize,
          }}
          key={tog[i].id}
        >
          <div style={{ flex: 1 }}>{tog[i].fromNowM}m</div>
          <div style={{ flex: 1 }}>{tog[i].faktiskTid.format('HH:mm')}</div>
          <div style={{ flex: 2.2 }}>{tog[i].skalTil}</div>
        </div>,
      );
    }
    return out;
  }

  public render() {
    return (
      <div
        style={{
          display: 'flex',
          padding: '0.5vh',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        {this.getTrainList()}
      </div>
    );
  }
}

export default connect()(Ruter);
