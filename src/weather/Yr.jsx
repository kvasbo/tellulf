import React, { Component } from 'react';
import _ from 'lodash';
import SunCalc from 'suncalc';
import Moment from 'moment';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Label } from 'recharts';
import firebase from '../firebase';
import WeatherIcon from './WeatherIconSvg';
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
      this.setListeners();
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
        hours, limits,
      });
    });
  }

  getTemperatureTicks() {
    return this.state.limits.ticks;
  }

  renderDots(data) {
    return <WeatherIcon hour={data.payload} />
  }

  formatTick(data) {
    const time = Moment(data);
    return time.format("HH");
  }

  // Stays on
  render() {
    // console.log(this.state.hours);
    return (
      <div className="yr-container">
        <ComposedChart margin={{ top: 10, right: 20, left: 30, bottom: 10 }} width={540} height={290} data={this.state.hours}>
          <XAxis dataKey="time" tickFormatter={this.formatTick} interval={0} />
          <YAxis yAxisId="temp" ticks={this.getTemperatureTicks()} mirror type="number" tickCount={4} domain={[this.state.limits.lowerRange, this.state.limits.upperRange]} />
          <YAxis yAxisId="rain" mirror ticks={[4, 8, 12]} type="number" orientation="right" domain={[0, 12]} />
          <Label value="Pages of my website" offset={0} position="insideTopLeft" />
          <Line dot={<WeatherIcon />} yAxisId="temp" type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={0} />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="rain" stroke="#8884d8" />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="minRain" stroke="#8884d888" />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="maxRain" stroke="#8884d888" />
        </ComposedChart>
      </div>
    );
  }
}

// div className="weatherMeta">
// {getSunMeta()}
// </div>

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

  const roundedMin = Math.round(minTemp.value);
  const roundedMax = Math.round(maxTemp.value);

  const quarter = Moment().quarter();

  let upperRange = 15;
  let lowerRange = -15;
  let ticks = [-15, -10, -5, 5, 10, 15];

  if ((quarter === 2 || quarter === 3) && roundedMin >= 0) {
    upperRange = Math.max(30, roundedMax);
    lowerRange = 0;
    ticks = [10, 20, 30];
  } else if (roundedMin >= 0 && roundedMax > 15) {
    upperRange = Math.max(30, roundedMax);
    lowerRange = 0;
    ticks = [10, 20, 30];
  } else if (roundedMax < 0 && roundedMin < -15) {
    upperRange = 0;
    lowerRange = Math.min(-30, roundedMin);
    ticks = [-10, -20, -30];
  }

  return {
    maxRain, lowerRange, upperRange, ticks,
  };
}

function setNewTimes() {
  const queryStart = Number(new Moment().startOf('day').format('x'));
  const queryEnd = Number(new Moment().startOf('day').add(2, 'days').format('x'));
  return { start: queryStart, end: queryEnd };
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
