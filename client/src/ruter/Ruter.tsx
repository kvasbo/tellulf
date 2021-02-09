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

  private getTrainList(): JSX.Element[] {
    let tog = [];
    const trains = Object.values(this.props.trains);

    tog = trains.map((t) => parseTrain(t));

    tog = tog
      .sort((a, b) => {
        return a.fromNow - b.fromNow;
      })
      .slice(0, 10);

    const out: JSX.Element[] = [];
    tog.forEach((t) => {
      let pic = '';
      if (t.type === 'Bane') {
        pic = 'subway-outline.svg';
      } else if (t.type === 'Buss') {
        pic = 'bus-outline.svg';
      }

      out.push(
        <tr key={t.id}>
          <td>{t.fromNowM} m</td>
          <td style={{ textAlign: 'left' }}>
            <img src={pic} style={{ color: '#fff', height: '1em', width: '1em' }} />
            &nbsp;{t.linje}
          </td>

          <td>{t.faktiskTid.format('HH:mm')}</td>
          <td>{t.skalTil}</td>
        </tr>,
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
          height: '100%',
          fontSize: '0.8em',
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <table style={{ height: '100%' }}>
          <tbody>{this.getTrainList()}</tbody>
        </table>
      </div>
    );
  }
}

export default connect()(Ruter);
