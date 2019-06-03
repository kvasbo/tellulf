import React from 'react';
import Moment from 'moment';
import { TrainDataSet, TrainData, ExtendedTrainData } from '../types/trains';
import './ruter.css';

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
        <li className="togStil" key={tog[i].id}>
          {tog[i].fromNowM}
        </li>,
      );
    }
    return out;
  }

  public render() {
    return (
      <div style={{ display: 'relative', padding: '0.5vh' }}>
        <ul className="togListe">{this.getTrainList()}</ul>
      </div>
    );
  }
}

export default Ruter;
