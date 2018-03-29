import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import SunCalc from 'suncalc';
import WeatherIcon from './WeatherIcon';
import './yr.css';

export default class Hour extends Component {
  constructor(props) {
    super(props);
    this.from = new Moment(props.hour.from);
    this.to = new Moment(props.hour.to);
    this.state = {

    };
  }

  getDayTime() {
    const time = new Moment(this.props.hour.time);
    const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
    return time.isBetween(sunTimes.dawn, sunTimes.dusk);
  }

  getTempText() {
    return Math.abs(Math.round(this.props.hour.temperature));
  }

  getTemperatureColor() {
    if (this.props.hour.temperature < 0) return 'rgb(100,100,255)';
    return 'rgb(255,255,255)';
  }

  getTempHeight() {
    const fromBottom = 0;
    const maxHeight = 100;
    const fromMin = this.props.hour.temperature - this.props.limits.lowerRange;
    const percentOfRange = fromMin / (this.props.limits.upperRange - this.props.limits.lowerRange);
    const height = fromBottom + (maxHeight * percentOfRange);
    return `calc(${height}% - 25px`;
  }

  getClass() {
    const hour = Number(new Moment(this.props.hour.from).format('H'));
    let out = 'hour';
    if (hour % 2 === 0) {
      out += ' odd';
    } else {
      out += ' even';
    }
    if (this.isEndOfDay()) out += ' endofday';
    return out;
  }

  getMinMaxRainColor() {
    if (this.props.hour.maxRain === 0) return 'rgba(0,0,0,0)';
    return 'rgba(0,0,255,0.25)';
  }

  getRainColor() {
    if (this.props.hour.rain === 0) return 'rgba(0,0,0,0)';
    return 'rgba(0,0,255,1)';
  }

  getMinMaxHeight() {
    const rp = this.getRainBaseNumbers();
    const height = rp.max - rp.min;
    const rh = `${height}%`;
    return rh;
  }

  getMinMaxBottom() {
    const rp = this.getRainBaseNumbers();
    const rh = `${rp.min}%`;
    return rh;
  }

  getRainHeight() {
    const rp = this.getRainBaseNumbers();
    const rh = `${rp.expected}%`;
    // console.log("rh", rp, rh);
    return rh;
  }

  getRainBaseNumbers() {
    const factor = 10;
    const expected = Math.min(98, this.props.hour.rain * factor);
    const max = Math.min(98, this.props.hour.maxRain * factor);
    const min = Math.min(98, this.props.hour.minRain * factor);
    return { expected, min, max };
  }

  getRainText() {
    if (this.props.hour.rain === 0) return null;
    return (this.props.hour.rain * 1).toFixed(1);
  }

  isEndOfDay() {
    const end = new Moment(this.props.hour.to);
    if (end.format('H') === '23' && this.isToday()) return true;
    return false;
  }

  isToday() {
    const end = new Moment(this.props.hour.to);
    return end.isSame(new Moment(), 'day');
  }

  render() {
    return (
      <div className={this.getClass()}>
        <div className="temperature" style={{ position: 'absolute', bottom: this.getTempHeight() }}>
          <WeatherIcon hour={this.props.hour} /><span style={{ color: this.getTemperatureColor() }}>{this.getTempText()}</span>
        </div>
        <div style={{
          backgroundColor: this.getMinMaxRainColor(),
          height: this.getRainHeight(),
          position: 'absolute',
          width: '100%',
          bottom: this.getMinMaxBottom(),
          }}
        />
        <div style={{
          display: 'flex',
          fontSize: '8pt',
          color: 'rgba(255,255,255,0.5)',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: this.getRainColor(),
          height: 12,
          position: 'absolute',
          width: '100%',
          bottom: this.getRainHeight(),
          }}
        >
          <div>{this.getRainText()}</div>
        </div>
      </div>
    );
  }
}

Hour.propTypes = {
  hour: PropTypes.object.isRequired,
  limits: PropTypes.object.isRequired,
};
