import React, { Component } from 'react';
import { connect } from 'react-redux';
import { maxBy, minBy, filter, sortBy, uniqBy } from 'lodash';
import SunCalc from 'suncalc';
import axios from 'axios';
import Moment from 'moment';
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceDot } from 'recharts';
import { updateWeather, updateWeatherLimits, updateWeatherLong } from '../redux/actions';
import WeatherIcon from './WeatherIconSvg';
import './yr.css';

const XML = require('pixl-xml');

const lat = '59.9409';
const long = '10.6991';
const sunMax = 0.75;
const sunMaxThreshold = 3000;

class Yr extends Component {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      currentTime: Moment().valueOf(),
    };
  }

  componentDidMount() {
    this.updateWeather();
    setInterval(() => { this.reloadTime(); }, 60000);
  }

  setNextReload() {
    // Start of next hour
    clearTimeout(this.reloadTimer);
    const nextReload = Moment().add(1, 'hours').startOf('hour');
    // const nextReload = Moment().add(1, 'minutes').startOf('minute');
    const nextReloadDiff = nextReload.diff(Moment());
    this.reloadTimer = setTimeout(() => this.updateWeather(), nextReloadDiff);
    console.log('Weather: Next reload: ', nextReload.toLocaleString());
  }

  reloadTime() {
    this.setState({ currentTime: Moment().valueOf() })
  }

  async updateWeather() {
    try {
      console.log('Updating weather');
      this.setNextReload();
      let weatherOut = loadWeatherFromLocalStorage();
      if (typeof weatherOut !== 'object' || weatherOut === null) {
        weatherOut = initWeather();
      }
      const { start, end } = getTimeLimits();
      const data = await axios.get(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat}&lon=${long}`);
      const parsed = XML.parse(data.data);
    
      try {
        const nextRun = Moment(parsed.meta.model[0].nextrun);
        const dataFrom = Moment(parsed.meta.model[0].runended);
        console.log('Data from', dataFrom.toLocaleString());
        console.log('Next run', nextRun.toLocaleString());
      } catch (err) {
        console.log('Could not get next run');
      }
      const singlePoints = parsed.product.time.filter((d) => {
        if (d.from !== d.to) return false;
        const from = Moment(d.from);
        if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
        return false;
      });
      const hours = parsed.product.time.filter((d) => {
        const from = Moment(d.from);
        const to = Moment(d.to);
        if (!(to.diff(from, 'hours') === 1)) return false;
        if (from.isSameOrAfter(start) && from.isSameOrBefore(end)) return true;
        return false;
      });
      const sixes = parsed.product.time.filter((d) => {
        const fromUtc = Moment(d.from).utc().hours();
        if (fromUtc % 6 !== 0) return false;
        const from = Moment(d.from);
        const to = Moment(d.to);
        if ((to.diff(from, 'hours') === 6)) return true;
        return false;
      });
      singlePoints.forEach((p) => {
        const time = Moment(p.from);
        const key = time.valueOf();
        if (key in weatherOut) {
          weatherOut[key].temp = Number(p.location.temperature.value);
          weatherOut[key].time = time.valueOf();
        }
      });
      const sixesOut = {};
      sixes.forEach((s) => {
        const from = Moment(s.from);
        const key = from.valueOf();
        const to = Moment(s.to);
        const time = Moment(from).add(3, 'hours');
        const rain = Number(s.location.precipitation.value, 10);
        const symbol = s.location.symbol.id;
        const minTemp = Number(s.location.minTemperature.value, 10);
        const maxTemp = Number(s.location.maxTemperature.value, 10);
        const temp = (minTemp + maxTemp) / 2;
        sixesOut[key] = { from: key, to: to.valueOf(), time: time.valueOf(), temp, minTemp, maxTemp, rain, symbol };
      });
      // Sun height
      Object.values(weatherOut).forEach((w) => {
        const tObject = Moment(w.time).toDate();
        const sun = SunCalc.getPosition(tObject, lat * 1, long * 1);
        weatherOut[w.time].sunHeight = sun.altitude;
      });
      hours.forEach((p) => {
        const time = Moment(p.from);
        const key = time.valueOf();
        if (key in weatherOut) {
          weatherOut[key].rain = Number(p.location.precipitation.value);
          weatherOut[key].rainMin = Number(p.location.precipitation.minvalue);
          weatherOut[key].rainMax = Number(p.location.precipitation.maxvalue);
          weatherOut[key].symbol = p.location.symbol.id;
          weatherOut[key].symbolNumber = p.location.symbol.number;
        }
      });
      const limits = parseLimits(weatherOut);
      try {
        this.props.dispatch(updateWeather(weatherOut));
        this.props.dispatch(updateWeatherLong(sixesOut));
        this.props.dispatch(updateWeatherLimits(limits));
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  }

  formatTick(data) {
    const time = Moment(data, 'x');
    return time.format('HH');
  }

  getData() {
    const rawData = Object.values(this.props.weather);
    const uniqueData = uniqBy(rawData, 'time');
    const sortedData = sortBy(uniqueData, 'time');
    return sortedData;
  }

  // Stays on
  render() {
    if (!this.props.weather || !this.props.limits) {
      return null;
    }
    // const currentSun = Math.min(sunMaxThreshold, this.props.currentSolar.now);
    // const sunPercent = (currentSun / sunMaxThreshold) * sunMax;
    return (
      <div className="yr-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, left: 30, bottom: 10 }} data={this.getData()}>
            <defs>
              <radialGradient id="sunGradient">
                <stop offset="7%" stopColor={getColorForSun()} stopOpacity="1" />
                <stop offset="14%" stopColor={getColorForSun()} stopOpacity="0.2" />
                <stop offset="95%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>
            <XAxis dataKey="time" tickFormatter={this.formatTick} ticks={getTicks()} interval={3} type="number" domain={['dataMin', 'dataMax']} />
            <YAxis yAxisId="temp" mirror type="number" ticks={this.props.limits.ticks} domain={[this.props.limits.lowerRange, this.props.limits.upperRange]} />
            <YAxis yAxisId="rain" mirror ticks={[4, 8, 12]} type="number" orientation="right" domain={[0, 12]} />
            <YAxis yAxisId="sun" hide allowDataOverflow ticks={[]} type="number" orientation="right" domain={[0, 1.54]} />
            <Line dot={false} yAxisId="sun" type="monotone" dataKey="sunHeight" stroke="#FFFFFF88" />
            <ReferenceDot x={this.state.currentTime} y={getSunForTime(this.state.currentTime)} yAxisId="sun" fill="url(#sunGradient)" stroke="none" r={90} />
            <Line dot={false} yAxisId="rain" type="monotone" dataKey="rain" stroke="#8884d8" />
            <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMin" stroke="#8884d888" />
            <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMax" stroke="#8884d888" />
            <Line dot={<WeatherIcon />} yAxisId="temp" type="monotone" dataKey="temp" stroke="#8884d8" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

function getSunForTime(time) {
  const t = Moment(time).toDate();
  const s = SunCalc.getPosition(t, lat * 1, long * 1);
  return s.altitude;
}

function getColorForSun() {
  const cutoff = 0.35;
  const base = 120;
  const altitude = getSunForTime(new Date());
  if (altitude > cutoff) return '#FFD700';
  const percent = altitude / cutoff;
  const percentRed = Math.min(215, base + (215 * percent));
  const redString = Math.round(percentRed).toString(16);
  return `#FF${redString}00`;
}

function getTicks() {
  const limits = getTimeLimits();
  const time = limits.start;
  const out = [];
  for (let i = 0; i < 49; i += 1) {
    out.push(time.valueOf());
    time.add(1, 'hours');
  }
  return out;
}

function getTimeLimits() {
  const start = new Moment().startOf('day');
  const end = new Moment().add(1, 'day').endOf('day');
  return { start, end };
}

function initWeather() {
  const out = {};
  const now = new Moment().startOf('day');
  for (let i = 0; i < 48; i++) {
    const key = now.valueOf();
    out[key] = { temp: null, rain: null, rainMin: null, rainMax: null, symbol: null, symbolNumber: null, sunHeight: null, time: now.valueOf() };
    now.add(1, 'hours');
  }
  return out;
}

// Remove anything but today and tomorrow.
function pruneWeatherData(data) {
  const { start, end } = getTimeLimits();
  const newData = filter(data, (val, key) => {
    return Moment(key).isBetween(start, end, null, '(]');
  });
  const outObject = {};
  newData.forEach((d) => {
    outObject[d.time] = d;
  });
  return outObject;
}

function loadWeatherFromLocalStorage() {
  let loaded = null; //store.get('weather');
  if (!loaded) {
    loaded = {};
  }
  loaded = pruneWeatherData(loaded);
  const todayAndTomorrow = initWeather();
  return { ...todayAndTomorrow, ...loaded };
}

function parseLimits(data) {
  const now = new Moment();
  const quarter = now.quarter();
  const dataArray = Object.values(data);
  const maxRainPoint = maxBy(dataArray, 'rainMax');
  const maxRain = maxRainPoint.rainMax;
  const maxRainTime = maxRainPoint.time;
  const maxTempPoint = maxBy(dataArray, 'temp');
  const maxTemp = maxTempPoint.temp;
  const maxTempTime = maxTempPoint.time;
  const minTempPoint = minBy(dataArray, 'temp');
  const minTemp = minTempPoint.temp;
  const minTempTime = minTempPoint.time;
  const roundedMin = Math.floor(minTemp);
  const roundedMax = Math.ceil(maxTemp);
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
  const sunData = getSunMeta();
  const out = {
    lowerRange, upperRange, maxRain, maxRainTime, maxTemp, maxTempTime, minTemp, minTempTime, ticks, ...sunData,
  };
  return out;
}

function getSunMeta() {
  const now = new Moment();
  const yesterday = new Moment(now).subtract(1, 'days');
  const sunTimes = SunCalc.getTimes(new Date(), 59.9409, 10.6991);
  const sunTimesYesterday = SunCalc.getTimes(yesterday.toDate(), 59.9409, 10.6991);
  const sunriseM = new Moment(sunTimes.sunrise);
  const sunsetM = new Moment(sunTimes.sunset);
  const sunriseYesterday = new Moment(sunTimesYesterday.sunrise);
  const sunsetYesterday = new Moment(sunTimesYesterday.sunset);
  const diffRise = sunriseM.diff(sunriseYesterday, 'minutes') - 1440;
  const diffSet = sunsetM.diff(sunsetYesterday, 'minutes') - 1440;
  const sunrise = sunriseM.valueOf();
  const sunset = sunsetM.valueOf();
  return {
    sunrise, sunset, diffRise, diffSet,
  };
}

const mapStateToProps = state => {
  return {
    weather: state.Weather.weather,
    limits: state.Weather.limits,
    // currentSolar: state.Solar.current,
  };
}

export default connect(mapStateToProps)(Yr);
