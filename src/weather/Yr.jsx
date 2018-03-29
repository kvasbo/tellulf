import React, { Component } from 'react';
import _ from 'lodash';
import SunCalc from 'suncalc';
import Moment from 'moment';
import Hour from './Hour';
import HourMarker from './HourMarker';
import firebase from '../firebase';
import './yr.css';

export default class Yr extends Component {
  constructor(props) {
    super(props);
    const times = setNewTimes();

    this.state = {
      limits: {},
      queryStart: times.start,
      queryEnd: times.end,
      hours: [],
      haveUpdated: false,
      maxTemp: null,
      minTemp: null,
    };

    this.theChart = null;
    this.oppdateringsFrekvens = 3600;
  }

  componentDidMount() {
    this.setListeners();

    setInterval(() => {
      const times = setNewTimes();
      this.setState({
        queryStart: times.start,
        queryEnd: times.end,
      });
    }, 1000 * this.oppdateringsFrekvens);
  }

  setListeners() {
    const firestore = firebase.firestore().collection('weatherHourly');

    firestore.where(
      'fromStamp',
      '>=', Number(this.state.queryStart),
    ).where('fromStamp', '<=', Number(this.state.queryEnd)).onSnapshot((querySnapshot) => {
      const out = [];
      querySnapshot.forEach((doc) => {
        out.push(doc.data());
      });

      const limits = parseLimits(out);
      const hours = parseHours(out);
      this.setState({
        hours, limits, haveUpdated: true, maxTemp: limits.upperRange, minTemp: limits.lowerRange,
      });
    });
  }

  getHours() {
    if (!this.state.haveUpdated) return (<div>Laster</div>);

    const out = this.state.hours.map(hour => (
      <Hour key={hour.from} limits={this.state.limits} hour={hour} />
    ));
    return out;
  }

  renderHourMarkers() {
    const out = this.state.hours.map(hour => (
      <HourMarker key={hour.from} limits={this.state.limits} hour={hour} />
    ));
    return out;
  }

  // Stays on
  render() {
    return (
      <div className="yr-container">
        <div className="weatherMeta">
          {getSunMeta()}
        </div>
        <div className="graphDiv">
          <div className="overview">
            <div className="maxMin max" style={{ color: getMinMaxColor(this.state.maxTemp) }}>{this.state.maxTemp}</div>
            <div className="maxMin min" style={{ color: getMinMaxColor(this.state.minTemp) }}>{this.state.minTemp}</div>
          </div>
          <div className="fullGraph">
            <div className="hoursContainer">
              {this.getHours()}
              <div style={{
 width: '3px', position: 'absolute', left: getCurrentPosition(), height: '100%', backgroundColor: 'rgba(255,255,255,0.5)',
}}
              />
            </div>
            <div className="hoursDiv">
              {this.renderHourMarkers()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function parseHours(data) {
  const out = [];

  for (let i = 1; i < data.length - 1; i += 3) {
    const tmp = {};
    tmp.from = data[i - 1].from;
    tmp.to = data[i + 1].from;
    tmp.time = data[i].from;
    tmp.icon = data[i].icon;
    tmp.temperature = (Number(data[i - 1].temperature.value) + Number(data[i].temperature.value) + Number(data[i + 1].temperature.value)) / 3;
    tmp.rain = (Number(data[i - 1].rainDetails.rain) + Number(data[i].rainDetails.rain) + Number(data[i + 1].rainDetails.rain)) / 3;
    tmp.minRain = (Number(data[i - 1].rainDetails.minRain) + Number(data[i].rainDetails.minRain) + Number(data[i + 1].rainDetails.minRain)) / 3;
    tmp.maxRain = (Number(data[i - 1].rainDetails.maxRain) + Number(data[i].rainDetails.maxRain) + Number(data[i + 1].rainDetails.maxRain)) / 3;
    tmp.cloudiness = (Number(data[i - 1].cloudiness.percent) + Number(data[i].cloudiness.percent) + Number(data[i + 1].cloudiness.percent)) / 3;
    tmp.windSpeed = (Number(data[i - 1].windSpeed.mps) + Number(data[i].windSpeed.mps) + Number(data[i + 1].windSpeed.mps)) / 3;
    out.push(tmp);
  }
  return out;
}

function parseLimits(data) {
  const temp = data.map(hour => ({ time: new Moment(hour.fromStamp).toISOString(), value: Number(hour.temperature.value) }));
  const maxRainArr = data.map(hour => ({ time: new Moment(hour.fromStamp).toISOString(), value: Number(hour.rainDetails.maxRain) }));
  // Get max rain
  const maxRain = _.maxBy(maxRainArr, 'value');
  // Get max rain
  const maxTemp = _.maxBy(temp, 'value');
  // Get max rain
  const minTemp = _.minBy(temp, 'value');

  const month = new Date().getMonth() + 1;

  let upperRange = 15;
  let lowerRange = -15;

  if ((month > 4 || month < 10) && minTemp > 0) {
    upperRange = 30;
    lowerRange = 0;
  }

  if (minTemp > 0 && maxTemp > 15) {
    upperRange = 30;
    lowerRange = 0;
  }

  if (maxTemp < 0 && minTemp < -15) {
    upperRange = 0;
    lowerRange = -30;
  }

  return {
    maxRain, minTemp, maxTemp, lowerRange, upperRange,
  };
}

function setNewTimes() {
  const queryStart = Number(new Moment().startOf('day').format('x'));
  const queryEnd = Number(new Moment().startOf('day').add(2, 'days').format('x'));

  return { start: queryStart, end: queryEnd };
}

function getMinMaxColor(temp) {
  return (temp > 0) ? 'rgb(255,255,255)' : 'rgb(100,100,255)';
}

function getCurrentPosition() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  // Shift by one hour because we actually show from 23:00 last night
  let percentage = (((hours + 1) / 24) + (minutes / (60 * 24))) * 100;
  // Because we show two days
  percentage /= 2;
  return `${percentage}%`;
}

function getSunMeta() {
  const now = new Moment();
  const yesterday = new Moment(now).subtract(1, 'days');
  const sunTimes = SunCalc.getTimes(new Date(), 59.9409, 10.6991);
  const sunTimesYesterday = SunCalc.getTimes(yesterday.toDate(), 59.9409, 10.6991);
  const sunrise = new Moment(sunTimes.sunrise);
  const sunset = new Moment(sunTimes.sunset);
  const sunriseYesterday = new Moment(sunTimesYesterday.sunrise);
  const sunsetYesterday = new Moment(sunTimesYesterday.sunset);
  const diffRise = sunrise.diff(sunriseYesterday, 'minutes') - 1440;
  const diffSet = sunset.diff(sunsetYesterday, 'minutes') - 1440;
  return `Soloppgang: ${sunrise.format('LT')} (${diffRise}) - Solnedgang: ${sunset.format('LT')} (${diffSet})`;
}
