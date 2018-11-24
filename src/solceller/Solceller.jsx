import React from 'react';
import Moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import axios from 'axios';
import {
  XAxis,
  YAxis,
  Area,
  Line,
  ReferenceLine,
  ReferenceDot,
  ComposedChart,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import SunCalc from 'suncalc';
import {
  updateSolarMax,
  updateSolarCurrent,
  updatePowerPrices,
  updateInitStatus,
} from '../redux/actions';

const nettleie = 0.477;
const lat = 59.9409;
const long = 10.6991;
const sunMax = 0.75;
const sunMaxThreshold = 3000;

const maxSunHeight = getMaxSunHeight();

class Solceller extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      currentTime: Moment().valueOf(),
    };
  }

  componentDidMount() {
    setInterval(() => { this.reloadTime(); }, 60000);
    // setInterval(() => this.getPowerPrice(), 60 * 60 * 1000);
    this.getPowerPrice();
    this.attachMaxListeners();
    const dbRef = window.firebase.database().ref('steca/currentData');
    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();
        const dataTime = (typeof val.averages.time !== 'undefined') ? Moment(val.averages.time) : null;
        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
        const today = (typeof val.today.val !== 'undefined') ? val.today.val : null;
        const month = (typeof val.month.val !== 'undefined') ? val.month.val : null;
        const year = (typeof val.year.val !== 'undefined') ? val.year.val : null;
        const total = (typeof val.total.val !== 'undefined') ? val.total.val : null;
        const averageFull = (typeof val.averages.full !== 'undefined') ? val.averages.full : null;
        const averageMinute = (typeof val.averages['1'] !== 'undefined') ? val.averages['1'] : null;
        const byHour = (typeof val.todayByHour.val !== 'undefined') ? parseByHour(val.todayByHour.val) : null;
        const currentTime = Moment();
        const state = {
          now, today, month, year, total, byHour, currentTime, averageFull, averageMinute, dataTime,
        };
        this.props.dispatch(updateSolarCurrent(state));
        this.props.dispatch(updateInitStatus('solar'));
      } catch (err) {
        console.log(err);
      }
    });
  }

  async getPowerPrice() {
    try {
      const data = await axios({
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: { Authorization: 'bearer 1a3772d944bcf972f1ee84cf45d769de1c80e4f0173d665328287d1e2a746004' },
        data: {
          query: `
            {viewer {homes {currentSubscription {priceInfo {today {total energy tax startsAt }}}}}}
            `,
        },
      });
      if (data.status === 200) {
        const prices = data.data.data.viewer.homes[0].currentSubscription.priceInfo.today;
        const powerPrices = {};
        prices.forEach((p) => {
          const h = Moment(p.startsAt).hours();
          powerPrices[h] = { total: p.total + nettleie };
        });
        this.props.dispatch(updatePowerPrices(powerPrices));
        this.props.dispatch(updateInitStatus('powerPrices'));
      }
    } catch (err) {
      console.log(err);
    }
  }

  getCurrentLabelPosition() {
    if (this.props.current.averagefull > 3300) {
      return 'bottom';
    }
    return 'top';
  }

  getData() {
    const dataSet = getDataPointObject();
    // Map production data
    this.props.current.byHour.forEach((h) => {
      if (h.time in dataSet) {
        dataSet[h.time].production = h.production;
        const hour = new Date(h.time);
        const hr = hour.getHours();
        const price = this.props.powerPrices[hr];
        dataSet[h.time].sun = getSunForTime(hour);
        dataSet[h.time].price = price.total;
      }
    });
    return Object.values(dataSet);
  }

  getProductionForHour(hour) {
    try {
      const start = Moment().hour(hour).startOf('hour');
      const end = Moment().hour(hour).endOf('hour');

      const samplesForHour = this.props.current.byHour.filter((h) => {
        return Moment(h.time).isBetween(start, end);
      });

      let sum = 0;
      samplesForHour.forEach((h) => {
        sum += h.production;
      });
      if (!samplesForHour || samplesForHour.length === 0) return 0;
      return sum / samplesForHour.length;
    } catch (err) {
      return 0;
    }
  }

  getMoneySavedToday() {
    try {
      let sum = 0;
      for (let i = 0; i < 24; i += 1) {
        const production = this.getProductionForHour(i);
        const price = this.props.powerPrices[i];
        const savedThisHour = (production * price.total) / 1000;
        sum += savedThisHour;
      }
      return Math.round(sum * 100) / 100;
    } catch (err) {
      console.log(err);
      return '?';
    }
  }

  async attachMaxListeners() {
    const now = Moment();
    const y = now.format('YYYY');
    const m = now.format('MM');
    const d = now.format('DD');
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = 'steca/maxValues/ever/';

    const dbRefDayMax = window.firebase.database().ref(refDay);
    dbRefDayMax.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxDay: val.value };
        this.props.dispatch(updateSolarMax(state));
      }
    });

    const dbRefMonthMax = window.firebase.database().ref(refMonth);
    dbRefMonthMax.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxMonth: val.value };
        this.props.dispatch(updateSolarMax(state));
      }
    });

    const dbRefYearMax = window.firebase.database().ref(refYear);
    dbRefYearMax.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxYear: val.value };
        this.props.dispatch(updateSolarMax(state));
      }
    });

    const dbRefEverMax = window.firebase.database().ref(refEver);
    dbRefEverMax.on('value', (snapshot) => {
      const val = snapshot.val();
      if (val && val.value) {
        const state = { maxEver: val.value };
        this.props.dispatch(updateSolarMax(state));
      }
    });
  }

  reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  render() {
    if (!this.props.initState.powerPrices || !this.props.initState.solar) return null;
    const currentSun = Math.min(sunMaxThreshold, this.props.currentSolar);
    const sunPercent = (currentSun / sunMaxThreshold) * sunMax;
    const dataAge = this.props.current.dataTime.diff(Moment(), 'seconds');
    const textColor = (dataAge < 120) ? '#FFFFFF' : '#FF0000'; // Rød tekst om data er over to minutter gamle
    const data = this.getData();
    return (
      <div style={{
        display: 'flex', flex: 1, flexDirection: 'column', height: '100%',
      }}
      >
        <div style={{ display: 'flex', flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{
                top: 0,
                right: 10,
                left: 10,
                bottom: 0,
              }}
              data={data}
            >
              <defs>
                <radialGradient id="sunGradient">
                  <stop offset="7%" stopColor={getColorForSun()} stopOpacity="1" />
                  <stop offset="14%" stopColor={getColorForSun()} stopOpacity={sunPercent} />
                  <stop offset="95%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
              </defs>
              <XAxis dataKey="time" type="number" scale="time" tickFormatter={formatTick} ticks={getXTicks()} domain={['dataMin', 'dataMax']} />
              <YAxis
                width={25}
                yAxisId="price"
                ticks={[0.5, 1.0, 1.5, 2]}
                orientation="right"
                type="number"
                domain={[0, 2]}
                label={{
                  angle: 90,
                  value: 'kr',
                  stroke: '#ffffff55',
                  fill: '#ffffff55',
                  fontSize: 15,
                  position: 'right',
                }}
              />
              <YAxis
                width={25}
                label={{
                  angle: -90,
                  value: 'kwh',
                  stroke: '#ffffff55',
                  fill: '#ffffff55',
                  fontSize: 15,
                  position: 'left',
                }}
                yAxisId="kwh"
                ticks={[1000, 2000, 3000, 4000]}
                type="number"
                tickFormatter={formatYTick}
                domain={[0, 4000]}
              />
              <YAxis
                width={25}
                yAxisId="sun"
                hide
                allowDataOverflow
                ticks={[]}
                type="number"
                orientation="right"
                domain={[0, maxSunHeight]}
              />
              <Line yAxisId="price" dot={false} type="step" connectNulls dataKey="price" stroke="#8884d8" />
              <Line dot={false} yAxisId="sun" type="basis" dataKey="sun" stroke="#FFFFFF88" />
              <Area
                yAxisId="kwh"
                dot={false}
                type="monotone"
                dataKey="production"
                fill="#00FF00"
                stroke="#00FF00"
                fillOpacity="0.2"
                strokeOpacity="0.2"
              />
              <CartesianGrid stroke="#FFFFFF55" strokeDasharray="1 2" vertical={false} />
              <ReferenceLine
                yAxisId="kwh"
                y={this.props.max.maxDay}
                stroke="#FFFF0088"
                strokeDasharray="3 3"
              />
              <ReferenceDot
                x={this.state.currentTime}
                y={getSunForTime(this.state.currentTime)}
                yAxisId="sun"
                fill="url(#sunGradient)"
                stroke="none"
                r={90}
              />
              {(this.props.current.now > 0) && (
              <ReferenceDot
                yAxisId="kwh"
                y={this.props.current.now}
                x={this.props.current.currentTime.valueOf()}
                r={3}
                fill="#ffffff44"
                stroke="#ffffff"
                label={{
                  value: `${this.props.current.averageMinute}W`,
                  stroke: textColor,
                  fill: textColor,
                  fontSize: 50,
                  position: this.getCurrentLabelPosition(),
                }}
              />)}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          padding: 0,
        }}
        >
          <div>Dag: {getRoundedNumber(Number(this.props.current.today) / 1000)} kWh / {this.getMoneySavedToday()} kr</div>
          <div>Måned: {getRoundedNumber(parseFloat(this.props.current.month) / 1000)}</div>
          <div>År: {getRoundedNumber(parseFloat(this.props.current.year) / 1000)}</div>
          <div>Totalt: {getRoundedNumber(parseFloat(this.props.current.total) / 1000)}</div>
        </div>
      </div>
    );
  }
}

Solceller.propTypes = {
  dispatch: PropTypes.func.isRequired,
  current: PropTypes.object.isRequired,
  currentSolar: PropTypes.number.isRequired,
  max: PropTypes.object.isRequired,
  initState: PropTypes.object.isRequired,
  powerPrices: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    current: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    currentSolar: Math.round(state.Solar.current.now / 100) * 100,
    initState: state.Init,
  };
};

export default connect(mapStateToProps)(Solceller);

function getSunForTime(time) {
  const s = SunCalc.getPosition(Moment(time).toDate(), lat, long);
  return Math.max(0, s.altitude);
}

function getMaxSunHeight() {
  try {
    // Get max height of sun in position
    const solstice = Moment('2018-06-21').toDate();
    const sunTimes = SunCalc.getTimes(solstice, lat, long);
    const data = SunCalc.getPosition(sunTimes.solarNoon, lat, long);
    return data.altitude;
  } catch (err) {
    return 1;
  }
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

function getDataPointObject() {
  const out = {};
  const time = Moment().startOf('day');
  for (let i = 0; i < 144; i += 1) {
    const key = time.valueOf();
    out[key] = { time: key, production: null, price: null };
    time.add(10, 'minutes');
  }
  return out;
}

function getRoundedNumber(number) {
  if (number < 10) {
    return number.toFixed(3);
  } if (number < 100) {
    return number.toFixed(2);
  } if (number < 1000) {
    return number.toFixed(1);
  }
  return number.toFixed(0);
}

function parseByHour(data) {
  const startOfDay = Moment().startOf('day');

  const out = data.map((d) => {
    const time = Moment(startOfDay).add(d.minutesFromMidnight, 'minutes');
    return { time: time.valueOf(), production: d.production };
  });
  return out;
}

function getXTicks() {
  const { start, end } = getTimeLimits();
  const out = [];
  while (start.isSameOrBefore(end)) {
    if (start.hours() % 2 === 0) {
      out.push(start.valueOf());
    }
    start.add(1, 'hours');
  }
  return out;
}

function formatTick(data) {
  const time = Moment(data).local();
  return time.format('HH');
}

function formatYTick(data) {
  return `${data / 1000}`;
}

export function getTimeLimits() {
  const start = new Moment().startOf('day');
  const end = new Moment().add(1, 'day').startOf('day');
  return { start, end };
}
