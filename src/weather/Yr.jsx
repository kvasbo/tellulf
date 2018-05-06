import React, { Component } from 'react';
import { maxBy, minBy, filter } from 'lodash';
import SunCalc from 'suncalc';
import axios from 'axios';
import Moment from 'moment';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Label } from 'recharts';
import WeatherIcon from './WeatherIconSvg';
import './yr.css';

const store = require('store');
const XML = require('pixl-xml');

const lat = '59.9409';
const long = '10.6991';

export default class Yr extends Component {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      weather: undefined,
    };
  }

  componentDidMount() {
    this.updateWeather();
    this.setNextReload();
  }

  setNextReload() {
    // Start of next hour
    clearTimeout(this.reloadTimer);
    const nextReload = Moment().add(1, 'hours').startOf('hour');
    const nextReloadDiff = nextReload.diff(Moment());
    this.reloadTimer = setTimeout(() => this.updateWeather(), nextReloadDiff);
    console.log('Weather: Next reload: ', nextReload.toLocaleString());
  }

  loadWeatherFromLocalStorage() {
    let loaded = store.get('weather');
    if (!loaded) {
      loaded = {};
    }
    loaded = pruneWeatherData(loaded);
    const todayAndTomorrow = initWeather();
    return { ...todayAndTomorrow, ...loaded };
  }

  

  async updateWeather() {
    const weatherOut = this.loadWeatherFromLocalStorage();
    const { start, end } = getTimeLimits();
    const data = await axios.get(`https://api.met.no/weatherapi/locationforecast/1.9/?lat=${lat}&lon=${long}`);
    const parsed = XML.parse(data.data);
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
    singlePoints.forEach((p) => {
      const time = Moment(p.from);
      const key = time.toISOString();
      if (key in weatherOut) {
        weatherOut[key].temp = Number(p.location.temperature.value);
        weatherOut[key].time = time.toISOString();
      }
    });
    hours.forEach((p) => {
      const time = Moment(p.from);
      const key = time.toISOString();
      if (key in weatherOut) {
        weatherOut[key].rain = Number(p.location.precipitation.value);
        weatherOut[key].rainMin = Number(p.location.precipitation.minvalue);
        weatherOut[key].rainMax = Number(p.location.precipitation.maxvalue);
        weatherOut[key].symbol = p.location.symbol.id;
        weatherOut[key].symbolNumber = p.location.symbol.number;
        weatherOut[key].time = time.toISOString();
      }
    });
    store.set('weather', weatherOut);
    this.setState({ weather: weatherOut });
  }

  formatTick(data) {
    const time = Moment(data);
    return time.format("HH");
  }

  getData() {
    const all = Object.values(this.state.weather);
    return all;
  }

  // Stays on
  render() {
    if (!this.state.weather) {
      return null;
    }
    return (
      <div className="yr-container">
        <ComposedChart margin={{ top: 10, right: 20, left: 30, bottom: 10 }} width={540} height={290} data={this.getData()}>
          <XAxis dataKey="time" tickFormatter={this.formatTick} interval={3} />
          <YAxis yAxisId="temp" mirror type="number" tickCount={4} domain={[0, 30]} />
          <YAxis yAxisId="rain" mirror ticks={[4, 8, 12]} type="number" orientation="right" domain={[0, 12]} />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="rain" stroke="#8884d8" />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMin" stroke="#8884d888" />
          <Line dot={false} yAxisId="rain" type="monotone" dataKey="rainMax" stroke="#8884d888" />
          <Line dot={<WeatherIcon />} yAxisId="temp" type="monotone" dataKey="temp" stroke="#8884d8" strokeWidth={1} />
        </ComposedChart>
      </div>
    );
  }
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
    const key = now.toISOString();
    out[key] = { temp: null, rain: null, rainMin: null, rainMax: null, symbol: null, symbolNumber: null, time: now.toISOString() };
    now.add(1, 'hours');
  }
  return out;
}

// Remove anything but today and tomorrow.
function pruneWeatherData(data) {
  const { start, end } = getTimeLimits();
  const newData = filter(data, (val, key) => {
    return Moment(key).isBetween(start, end, null, '[]');
  });
  const outObject = {};
  newData.forEach((d) => {
    outObject[d.time] = d;
  });
  return outObject;
}

function parseLimits(data) {
  const temp = data.map(hour => ({ time: new Moment(hour.fromStamp).toISOString(), value: Number(hour.temperature.value) }));
  const maxRainArr = data.map(hour => ({ time: new Moment(hour.fromStamp).toISOString(), value: Number(hour.rainDetails.maxRain) }));
  // Get max rain
  const maxRain = maxBy(maxRainArr, 'value');
  // Get max temp
  const maxTemp = maxBy(temp, 'value');
  // Get max rain
  const minTemp = minBy(temp, 'value');

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
    lowerRange, upperRange, ticks,
  };
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
