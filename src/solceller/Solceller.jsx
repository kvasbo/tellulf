import React from 'react';
import Moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import TibberRealtimeConsumptionWrapper from '@kvasbo/react-tibber-consumption';
import SunCalc from 'suncalc';
import {
  updateSolarMax,
  updateSolarCurrent,
  updateInitStatus,
  updateSetting,
} from '../redux/actions.ts';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;
const sunMax = 0.75;
const sunMaxThreshold = 3000;

const maxSunHeight = getMaxSunHeight();

const smallStyle = {
  fontSize: '10pt',
  color: '#999999',
};

class Solceller extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      currentTime: Moment().valueOf(),
      power: 0,
      accumulatedConsumption: 0,
      // accumulatedCost: 0,
      averagePower: 0,
      maxPower: 0,
      minPower: 0,
      tibberApiKey: null,
      tibberHomeKey: null,
    };
  }

  componentDidMount() {
    setInterval(() => { this.reloadTime(); }, 60000);
    this.attachMaxListeners();

    // Load (and init) settings
    const settingsRef = window.firebase.database().ref('settings');
    settingsRef.once('value', (snapshot) => {
      const settings = snapshot.val();
      console.log('Tibber settings', settings);
      if (!settings || !settings.tibberApiKey || !settings.tibberHomeKey) {
        settingsRef.set({ tibberApiKey: false, tibberHomeKey: false });
        return;
      }
      const { tibberApiKey, tibberHomeKey } = settings;
      this.setState({
        tibberApiKey, tibberHomeKey,
      });
    });

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

  getCurrentLabelPosition() {
    if (this.props.current.averagefull > 3300) {
      return 'bottom';
    }
    return 'top';
  }

  setPowerData(data) {
    if (data.power && data.accumulatedConsumption && data.accumulatedCost && data.averagePower && data.maxPower && data.minPower) {
      const {
        power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower,
      } = data;
      this.setState({
        power, accumulatedConsumption, accumulatedCost, averagePower, maxPower, minPower,
      });
    }
  }

  getData() {
    const dataSet = getDataPointObject();
    const dstAdd = Moment().isDST() ? 3600000 : 0;
    const timeZoneAdd = 3600000;
    // Map production data
    this.props.current.byHour.forEach((h) => {
      // Correct production time for UTC
      const correctedTime = h.time + timeZoneAdd + dstAdd;
      if (correctedTime in dataSet) {
        dataSet[correctedTime].production = h.production;
      }
      // Sun data
      if (h.time in dataSet) {
        const hour = new Date(h.time);
        const inAWeek = new Date(h.time + 604800000);
        const inTwoWeeks = new Date(h.time + 1209600000);
        const inAMonth = new Date(h.time + 2592000000);
        const hr = hour.getHours();
        const price = this.props.powerPrices[hr];
        dataSet[h.time].sun = getSunForTime(hour, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInAWeek = getSunForTime(inAWeek, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInTwoWeeks = getSunForTime(inTwoWeeks, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInAMonth = getSunForTime(inAMonth, this.props.latitude, this.props.longitude);
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
    let maxPower = 4500;
    let ticks = [1000, 2000, 3000, 4000];
    const currentPower = this.state.power + this.props.current.now; // Find actual current usage
    const producedPercent = (this.state.accumulatedConsumption > 0) ? (this.props.current.today / 10) / this.state.accumulatedConsumption : 0;
    // Dynamic scale
    if (this.props.settingSolarMaxDynamic) {
      maxPower = Math.ceil(Number(this.props.max.maxDay, 10) / 100) * 100;
      maxPower = Math.max(100, maxPower);
      ticks = [];
    } else {
      maxPower = (this.props.max.maxEver) ? Number(this.props.max.maxEver, 10) : 4500;
    }
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
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          {this.state.tibberApiKey && this.state.tibberHomeKey && (
          <TibberRealtimeConsumptionWrapper
            token={this.state.tibberApiKey}
            homeId={this.state.tibberHomeKey}
            display={false}
            onData={(powerData) => { this.setPowerData(powerData); }}
          />
          )}
          <div style={{ flex: 5 }}>
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
                  ticks={[...ticks]}
                  type="number"
                  tickFormatter={formatYTick}
                  domain={[0, maxPower]}
                  onClick={() => { this.props.dispatch(updateSetting('solarMaxDynamic', !this.props.settingSolarMaxDynamic)); }}
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
                <Line dot={false} yAxisId="sun" type="basis" dataKey="sunInAWeek" stroke="#FFFFFF55" />
                <Line dot={false} yAxisId="sun" type="basis" dataKey="sunInTwoWeeks" stroke="#FFFFFF33" />
                <Line dot={false} yAxisId="sun" type="basis" dataKey="sunInAMonth" stroke="#FFFFFF22" />
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
                  y={getSunForTime(this.state.currentTime, this.props.latitude, this.props.longitude)}
                  yAxisId="sun"
                  fill="url(#sunGradient)"
                  stroke="none"
                  r={90}
                />
                {(this.props.current.now > 0) &&
                (
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
                />)
                }
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            flex: 2, display: 'flex', flexDirection: 'row', justifyContent: 'top', alignItems: 'center',
            }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20pt' }}>
              <span style={smallStyle}>reelt forbruk</span>
              <br />
              {currentPower}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20pt' }}>
              <span style={smallStyle}>produksjon</span>
              <br />
              {this.props.current.now}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20pt' }}>
              <span style={smallStyle}>betalt forbruk</span>
              <br />
              {this.state.power}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20pt' }}>
              <span style={smallStyle}>produsert %</span>
              <br />
              {Math.round(producedPercent * 100) / 100}%
            </div>
          </div>
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>bruk dag</span><br />{Math.round(this.state.accumulatedConsumption * 1000) / 1000}kWh
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>bruk min</span><br />{this.state.minPower}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>bruk snitt</span><br />{Math.round(this.state.averagePower)}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>bruk max</span><br />{this.state.maxPower}W
            </div>
          </div>
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>prod dag</span>
              <br />
              {getRoundedNumber(Number(this.props.current.today) / 1000)}kWh
              <br />
              <span style={smallStyle}>max dag</span>
              <br />
              {this.props.max.maxDay}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>prod måned</span>
              <br />
              {getRoundedNumber(parseFloat(this.props.current.month) / 1000)}kWh
              <br />
              <span style={smallStyle}>max måned</span>
              <br />
              {this.props.max.maxMonth}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>prod år</span>
              <br />
              {getRoundedNumber(parseFloat(this.props.current.year) / 1000)}kWh
              <br />
              <span style={smallStyle}>max år</span>
              <br />
              {this.props.max.maxYear}W
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '12pt' }}>
              <span style={smallStyle}>prod totalt</span>
              <br />
              {getRoundedNumber(parseFloat(this.props.current.total) / 1000)}kWh
              <br />
              <span style={smallStyle}>max totalt</span>
              <br />
              {this.props.max.maxEver}W
            </div>
          </div>
        </div>

      </div>
    );
  }
}

Solceller.defaultProps = {
  latitude: defaultLatitude,
  longitude: defaultLongitude,
};

Solceller.propTypes = {
  dispatch: PropTypes.func.isRequired,
  current: PropTypes.object.isRequired,
  currentSolar: PropTypes.number.isRequired,
  max: PropTypes.object.isRequired,
  initState: PropTypes.object.isRequired,
  powerPrices: PropTypes.object.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  settingSolarMaxDynamic: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => {
  return {
    current: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    currentSolar: Math.round(state.Solar.current.now / 100) * 100,
    initState: state.Init,
    settingSolarMaxDynamic: state.Settings.solarMaxDynamic,
  };
};

export default connect(mapStateToProps)(Solceller);

function getSunForTime(time, latitude = defaultLatitude, longitude = defaultLongitude) {
  const s = SunCalc.getPosition(Moment(time).toDate(), latitude, longitude);
  return Math.max(0, s.altitude);
}

function getMaxSunHeight(latitude = defaultLatitude, longitude = defaultLongitude) {
  try {
    // Get max height of sun in position
    const solstice = Moment('2018-06-21').toDate();
    const sunTimes = SunCalc.getTimes(solstice, latitude, longitude);
    const data = SunCalc.getPosition(sunTimes.solarNoon, latitude, longitude);
    return data.altitude;
  } catch (err) {
    return 1;
  }
}

function getColorForSun(latitude = defaultLatitude, longitude = defaultLongitude) {
  const cutoff = 0.35;
  const base = 120;
  const altitude = getSunForTime(new Date(), latitude, longitude);
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
