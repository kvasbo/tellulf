import React from 'react';
import Moment from 'moment';
import PropTypes from 'prop-types';
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
import './solceller.css';
import { roundToNumberOfDecimals } from '../TellulfInfoCell';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;

const maxSunHeight = getMaxSunHeight();

class EnergyGraph extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = {
      currentTime: Moment().valueOf(),
    };
  }

  componentDidMount() {
    setInterval(() => { this.reloadTime(); }, 300000); // Flytt sola hvert femte minutt
  }

  getCurrentLabelPosition() {
    if (this.props.current.averagefull > 3300) {
      return 'bottom';
    }
    return 'top';
  }

  getData() {
    const dataSet = getDataPointObject();
    const dstAdd = Moment().isDST() ? 3600000 : 0;
    const timeZoneAdd = 3600000;
    const now = new Date();

    // Map production data
    this.props.current.byHour.forEach((h) => {
      // Correct production time for UTC
      const correctedTime = h.time + timeZoneAdd + dstAdd;
      if (correctedTime in dataSet) {
        dataSet[correctedTime].production = (h.production / 1000);
      }
      // Sun data and consumpton
      if (h.time in dataSet) {
        const hour = new Date(h.time);

        const inAWeek = Moment(h.time).add(1, 'week').toDate();
        const inTwoWeeks = Moment(h.time).add(2, 'week').toDate();
        const inAMonth = Moment(h.time).add(1, 'month').toDate();
        const hr = hour.getHours();

        // Price
        const price = this.props.powerPrices[hr];
        dataSet[h.time].price = price.total;

        // Sun data
        dataSet[h.time].sun = getSunForTime(hour, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInAWeek = getSunForTime(inAWeek, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInTwoWeeks = getSunForTime(inTwoWeeks, this.props.latitude, this.props.longitude);
        dataSet[h.time].sunInAMonth = getSunForTime(inAMonth, this.props.latitude, this.props.longitude);

        // Consumption
        if (hour < now) {
          if (hr in this.props.usedPower) {
            const usage = this.props.usedPower[hr];
            const kwh = Number(usage.consumption, 10);
            dataSet[h.time].consumption = kwh;
          }

          if (Moment(hour).isSame(Moment(), 'hour')) {
            dataSet[h.time].consumption = this.props.realtimePower.avgLastHour / 1000;
          }
        }
      }
    });
    // console.log(Object.values(dataSet));
    return Object.values(dataSet);
  }

  reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  render() {
    if (!this.props.initState.powerPrices || !this.props.initState.solar) return null;

    const dataAge = this.props.current.dataTime.diff(Moment(), 'seconds');
    const textColor = (dataAge < 120) ? '#FFFFFF' : '#FF0000'; // Rød tekst om data er over to minutter gamle
    const data = this.getData();

    return (
      <div style={{
        display: 'flex', flex: 1, flexDirection: 'column', height: '100%',
      }}
      >
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
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              tickFormatter={formatTick}
              allowDataOverflow={false}
              ticks={getXTicks()}
              domain={getXAxis()}
            />
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
                value: 'kw',
                stroke: '#ffffff55',
                fill: '#ffffff55',
                fontSize: 15,
                position: 'left',
              }}
              yAxisId="kwh"
              type="number"
              allowDataOverFlow={false}
              tickFormatter={formatEnergyScaleTick}
              domain={[0, getEnergyScaleMax]}
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
              stackId="1"
            />
            <Area
              yAxisId="kwh"
              dot={false}
              type="monotone"
              dataKey="consumption"
              fill="#FF0000"
              stroke="#FF0000"
              fillOpacity="0.15"
              strokeOpacity="0.15"
              stackId="1"
            />
            <CartesianGrid stroke="#FFFFFF55" strokeDasharray="1 2" vertical={false} yAxisId="kwh" />
            <ReferenceLine
              yAxisId="kwh"
              y={this.props.max.maxDay / 1000}
              stroke="#FFFF0088"
              strokeDasharray="3 3"
            />
            <ReferenceDot
              x={this.state.currentTime}
              y={getSunForTime(this.state.currentTime, this.props.latitude, this.props.longitude)}
              yAxisId="sun"
              fill="#FFFF00"
              stroke="none"
              r={8}
            />
            {(this.props.current.now > 0)
            && (
              <ReferenceDot
                yAxisId="kwh"
                y={this.props.current.now / 1000}
                x={this.props.current.currentTime.valueOf()}
                r={3}
                fill="#ffffff44"
                stroke="#ffffff"
                label={{
                  value: `${Number(this.props.current.averageMinute).toLocaleString()}W`,
                  stroke: textColor,
                  fill: textColor,
                  fontSize: 50,
                  position: this.getCurrentLabelPosition(),
                }}
              />
            )
            }
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

EnergyGraph.defaultProps = {
  usedPower: {},
};

EnergyGraph.propTypes = {
  current: PropTypes.object.isRequired,
  max: PropTypes.object.isRequired,
  initState: PropTypes.object.isRequired,
  powerPrices: PropTypes.object.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  realtimePower: PropTypes.object.isRequired,
  usedPower: PropTypes.object,
};

export default EnergyGraph;

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

// Get maximum value for energy scale axis
function getEnergyScaleMax(data) {
  const maxVal = Math.ceil(data / 1000);
  return Math.max(5, maxVal);
}

function formatEnergyScaleTick(data) {
  // return Number(data, 10).toLocaleString();
  return `${roundToNumberOfDecimals(data, 1)}`;
}

function getDataPointObject() {
  const out = {};
  const time = Moment().startOf('day');
  for (let i = 0; i < 144; i += 1) {
    const key = time.valueOf();
    out[key] = {
      time: key, production: null, price: null, consumption: null,
    };
    time.add(10, 'minutes');
  }
  return out;
}

function getXAxis() {
  const from = Moment().startOf('day').valueOf();
  const to = Moment().endOf('day').valueOf();
  return [from, to];
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

export function getTimeLimits() {
  const start = new Moment().startOf('day');
  const end = new Moment().add(1, 'day').startOf('day');
  return { start, end };
}
