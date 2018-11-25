import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import Tog from './Tog';
import './ruter.css';

class Ruter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.oppdateringsFrekvens = 10;
  }

  getTrainObjects() {
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

  render() {
    return (
      <div style={{ display: 'relative', padding: '0.5vh' }}>{this.getTrainObjects()}</div>
    );
  }
}

function parseTrain(data) {
  const train = { ...data };
  const now = Moment();
  train.fromNow = train.faktiskTid.diff(now, 's');
  train.fromNowM = train.faktiskTid.diff(now, 'm');
  train.ruteDiff = train.faktiskTid.diff(train.ruteTid, 'm');
  return train;
}

Ruter.propTypes = {
  trains: PropTypes.object.isRequired,
};

export default Ruter;
