import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SunCalc from 'suncalc';
import Moment from 'moment';
import './yr.css';
import symbols from './symbols';

const iconSize = 25;
const iconDisplacement = iconSize / 2;

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
    let icon = 'blank.svg';
    const nattdag = (this.getDayTime()) ? 'dag' : 'natt';
    if (this.props.payload.symbol in symbols) {
      icon = `${symbols[this.props.payload.symbol]}.svg`;
    }
    const returnStr = `icons/${nattdag}/${icon}`;
    return returnStr;
  }

  getTemp() {
    const temp = Math.round(this.props.payload.temp);
    return temp;
  }

  render() {
    if (!this.props.cy) return null;
    if (this.props.index % 3 !== 0) return null;
    return (
      <svg>
        <text x={this.props.cx} y={this.props.cy + 20} textAnchor="middle" fontFamily="sans-serif" fontSize="13px" fill="white">{this.getTemp()}</text>
        <image xlinkHref={this.getIcon()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px" />
      </svg>
    );
  }
}
// <image xlinkHref={this.getIcon()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px" />
// {this.getTemp()}
// <image xlinkHref={this.getIcon()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px"/>
WeatherIcon.propTypes = {

};

export default WeatherIcon;
