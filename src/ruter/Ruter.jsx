import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Moment from 'moment';
import Tog from './Tog';
import { fetchTrains } from '../redux/actions';
import './ruter.css';

class Ruter extends React.PureComponent {
  constructor(props) {
    super(props);
    this.oppdateringsFrekvens = 10;
  }

  componentDidMount() {
    // Ny
    setInterval(() => {
      this.props.dispatch(fetchTrains(this.props.stasjon, this.props.retning));
    }, 1000 * this.oppdateringsFrekvens);
    this.props.dispatch(fetchTrains(this.props.stasjon, this.props.retning));
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
  stasjon: PropTypes.string.isRequired,
  retning: PropTypes.string.isRequired,
  trains: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    trains: state.Trains,
  };
}

export default connect(mapStateToProps)(Ruter);
