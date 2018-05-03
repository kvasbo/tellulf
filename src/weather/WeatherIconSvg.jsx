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
    let icon = 'blank.png';
    const nattdag = (this.getDayTime()) ? 'dag' : 'natt';
    if (this.props.payload.icon in symbols) {
      icon = `${symbols[this.props.payload.icon]}.svg`;
    }
    const returnStr = `icons/${nattdag}/${icon}`;
    return returnStr;
  }

  getTemp() {
    return Math.round(this.props.payload.temperature);
  }

  render() {
    // console.log('custom', this.props);
    return (
      <svg>
        <image xlinkHref={this.getIcon()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px"/>
        <text x={this.props.cx} y={this.props.cy + 20} textAnchor="middle" fontFamily="sans-serif" fontSize="13px" fill="white">{this.getTemp()}</text>
      </svg>
    );
  }
}
/*
<div className="weatherIcon" style={{ position: 'absolute', height: 5, width: 5, backgroundColor: '#ffffff', top: this.props.cy, left: this.props.cx }} >
        Hei!
      </div>*/
// <img src={this.getIcon()} alt="weatherIcon" className={this.getClassForIcon()} />

/*
<svg width="5cm" height="4cm" version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <image xlink:href={this.getIcon()} x="0" y="0" height="50px" width="50px"/>
      </svg>
*/
/*

      */

WeatherIcon.propTypes = {
  hour: PropTypes.object.isRequired,
};

export default WeatherIcon;
