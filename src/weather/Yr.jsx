import React from 'react';
import { connect } from 'react-redux';
import filter from 'lodash/filter';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import axios from 'axios';
import Moment from 'moment';
import { ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, Area, CartesianGrid } from 'recharts';
import { updateWeather, updateWeatherLong } from '../redux/actions';
import WeatherIcon from './WeatherIcon';
import symbolMap from './symbolMap';
import './yr.css';

const XML = require('pixl-xml');

const lat = '59.9409';
const long = '10.6991';

class Yr extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
  }

  componentDidMount() {
    this.updateWeather();
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
      try {
        this.props.dispatch(updateWeather(weatherOut));
        this.props.dispatch(updateWeatherLong(sixesOut));
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
    const data = this.getData();
    return (
      <div className="yr-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 10, right: 20, left: 30, bottom: 10 }} data={data}>
            <XAxis dataKey="time" tickFormatter={this.formatTick} ticks={getTicks()} interval={3} type="number" domain={['dataMin', 'dataMax']} />
            <YAxis yAxisId="temp" mirror type="number" ticks={this.props.limits.ticks} domain={[this.props.limits.lowerRange, this.props.limits.upperRange]} />
            <YAxis yAxisId="rain" mirror allowDataOverflow ticks={[3, 6, 9]} type="number" orientation="right" domain={[0, 9]} />
            <CartesianGrid stroke="#FFFFFF55" strokeDasharray="1 2" vertical={false} />
            <Area dot={false} yAxisId="rain" type="monotone" dataKey="rain" stroke="#8884d8" />
            <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMin" stroke="#8884d8" strokeDasharray="2 2" />
            <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMax" stroke="#8884d8AA" strokeDasharray="2 2" />
            <Line dot={<WeatherIcon symbolMap={symbolMap} sunrise={this.props.limits.sunrise} sunset={this.props.limits.sunset} />} yAxisId="temp" type="monotone" dataKey="temp" stroke="#ffffffaa" strokeWidth={0.5} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

function getTicks() {
  const limits = getTimeLimits();
  const time = limits.start;
  const out = [];
  for (let i = 0; i < 73; i += 1) {
    out.push(time.valueOf());
    time.add(1, 'hours');
  }
  return out;
}

function getTimeLimits() {
  const start = new Moment().startOf('day');
  const end = new Moment().add(2, 'day').endOf('day');
  return { start, end };
}

function initWeather() {
  const out = {};
  const now = new Moment().startOf('day');
  for (let i = 0; i < 72; i++) {
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
  let loaded = null;
  if (!loaded) {
    loaded = {};
  }
  loaded = pruneWeatherData(loaded);
  const todayAndTomorrow = initWeather();
  return { ...todayAndTomorrow, ...loaded };
}

const mapStateToProps = state => {
  return {
    weather: state.Weather.weather,
    limits: state.Weather.limits,
  };
}

export default connect(mapStateToProps)(Yr);
