import React from 'react';
import Moment from 'moment';
import Tog from './Tog';
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
  private getTrainObjects() {
    const tog = [];
    const trains = Object.values(this.props.trains);
    for (let i = trains.length - 1; i > -1; i -= 1) {
      const t = parseTrain(trains[i]);
      tog.push(t);
    }

    const out = [];
    for (let i = 0; i < tog.length; i += 1) {
      out.push(<Tog key={tog[i].id} info={tog[i]} />);
    }
    return out;
  }

  public render() {
    return <div style={{ display: 'relative', padding: '0.5vh' }}>{this.getTrainObjects()}</div>;
  }
}

export default Ruter;
