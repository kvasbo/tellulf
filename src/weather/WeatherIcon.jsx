import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SunCalc from 'suncalc';
import Moment from 'moment';
import './yr.css';
import symbols from './symbols';

class WeatherIcon extends Component {
  componentDidMount() {
    // console.log(this.props.hour, this.props.limits);
  }

  getClassForIcon() {
    if (this.getDayTime()) return 'weatherIcon';
    return 'weathericon night';
  }

  getDayTime() {
    const time = new Moment(this.props.hour.time);
    const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
    return time.isBetween(sunTimes.dawn, sunTimes.dusk);
  }

  getIcon() {
    let icon = 'blank.png';
    const nattdag = (this.getDayTime()) ? 'dag' : 'natt';
    if (this.props.hour.icon in symbols) {
      icon = `${symbols[this.props.hour.icon]}.svg`;
    }
    return `icons/${nattdag}/${icon}`;
  }

  render() {
    return (
      <div className="weatherIcon">
        <img src={this.getIcon()} alt="weatherIcon" className={this.getClassForIcon()} />
      </div>
    );
  }
}

WeatherIcon.propTypes = {
  hour: PropTypes.object.isRequired,
};

export default WeatherIcon;
