import Moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { fetchTrains } from '../redux/actions';
import { GenericProps } from '../types/generic';
import { ExtendedTrainData, TrainData, TrainDataSet } from '../types/trains';

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

  private getTrainList() {
    let tog = [];
    const trains = Object.values(this.props.trains);

    tog = trains.map((t) => parseTrain(t));

    tog = tog
      .sort((a, b) => {
        return a.fromNow - b.fromNow;
      })
      .slice(0, 5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: any[] = [];
    tog.forEach((t) => {
      out.push(
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontSize: 16,
          }}
          key={t.id}
        >
          <div style={{ flex: 1, paddingLeft: '0.5em' }}>{t.linje}</div>
          <div style={{ flex: 1, paddingLeft: '0.5em' }}>{t.fromNowM}m</div>
          <div style={{ flex: 1, paddingLeft: '0.5em' }}>{t.faktiskTid.format('HH:mm')}</div>
          <div style={{ flex: 2.2, paddingLeft: '0.5em' }}>{t.skalTil}</div>
        </div>,
      );
    });
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
