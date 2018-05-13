import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SunCalc from 'suncalc';
import Moment from 'moment';
import './yr.css';
import symboler from './symboler';

class WeatherIcon extends Component {
  componentDidMount() {
    // console.log(this.props.hour, this.props.limits);
  }

  getDayTime() {
    const time = new Moment(this.props.payload.time);
    const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
    return time.isBetween(sunTimes.dawn, sunTimes.dusk);
  }

  getIcon() {
    let icon = symboler.blank;
    const nattdag = (this.getDayTime()) ? 'day' : 'night';
    if (this.props.payload.symbol in symboler[nattdag]) {
      icon = symboler[nattdag][this.props.payload.symbol];
    }
    return icon;
  }

  getTemp() {
    const temp = Math.round(this.props.payload.temp);
    return temp;
  }

  render() {
    if (!this.props.cy) return null;
    const time = Moment(this.props.payload.time);
    if (time.hours() % 3 !== 0) return null;
    return (
      <svg>
        <text x={this.props.cx} y={this.props.cy + 20} textAnchor="middle" fontFamily="sans-serif" fontSize="13px" fill="white">{this.getTemp()}</text>
        <image xlinkHref={this.getIcon()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px" />
      </svg>
    );
  }
}

WeatherIcon.defaultProps = {
  cx: undefined,
  cy: undefined,
  index: undefined,
  payload: undefined,
};

WeatherIcon.propTypes = {
  payload: PropTypes.object,
  cx: PropTypes.number,
  cy: PropTypes.number,
  index: PropTypes.number,
};

export default WeatherIcon;
