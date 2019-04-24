import React from 'react';
import Moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  XAxis,
  YAxis,
  Area,
  Line,
  ReferenceLine,
  ReferenceDot,
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import SunCalc from 'suncalc';

class EnergyGraph extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      currentTime: Moment().valueOf(),
    };
  }

  componentDidMount() {
    setInterval(() => { this.reloadTime(); }, 60000);
  }

  reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  render() {
    return (
      <div style={{ flex: 1 }}>
        Graf
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    currentSolar: Math.round(state.Solar.current.now / 100) * 100,
    initState: state.Init,
    settingSolarMaxDynamic: state.Settings.solarMaxDynamic,
    realtimePower: state.TibberRealTime,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(EnergyGraph);

function getTimeLimits() {
  const start = Moment().startOf('day');
  const end = new Moment().add(1, 'day').startOf('day');
  return { start, end };
}
