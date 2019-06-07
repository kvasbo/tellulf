import React from 'react';
import Moment from 'moment';
import { TrainDataSet, TrainData, ExtendedTrainData } from '../types/trains';
import './tog.css';

interface Props {
  trains: TrainDataSet;
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

class Ruter extends React.PureComponent<Props, {}> {
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
      .slice(0, 4);

    const out = [];
    for (let i = 0; i < tog.length; i += 1) {
      out.push(
        <tr className="togStil" key={tog[i].id}>
          <td>{tog[i].fromNowM}m</td>
          <td>{tog[i].faktiskTid.format('HH:mm')}</td>
          <td>{tog[i].skalTil}</td>
        </tr>,
      );
    }
    return out;
  }

  public render() {
    return (
      <table style={{ display: 'relative', padding: '0.5vh' }}>
        <tbody>{this.getTrainList()}</tbody>
      </table>
    );
  }
}

export default Ruter;
