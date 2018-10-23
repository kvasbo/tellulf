import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import Moment from 'moment';
import {
  ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, Area, CartesianGrid, ReferenceLine, ReferenceArea,
} from 'recharts';
import { fetchWeather } from '../redux/actions';
import { getTimeLimits } from './updateWeather';
import WeatherIcon from './WeatherIcon';
import symbolMap from './symbolMap';
import './yr.css';

const gridColor = '#FFFFFF88';

const steder = {
  oslo: { lat: 59.9409, long: 10.6991 },
  sandefjord: { lat: 59.1347624, long: 10.3250789 },
};

class Yr extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
    this.state = { sted: 'oslo' };
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
  }

  getData() {
    const rawData = Object.values(this.props.weather);
    const uniqueData = uniqBy(rawData, 'time');
    const sortedData = sortBy(uniqueData, 'time');
    return sortedData;
  }

  updateWeather() {
    this.setNextReload();
    const { lat, long } = steder[this.state.sted];
    this.props.dispatch(fetchWeather(lat, long));
  }

  stedEndra(e) {
    this.setState({ sted: e.currentTarget.value });
    const { lat, long } = steder[e.currentTarget.value];
    this.props.dispatch(fetchWeather(lat, long));
  }

  // Stays on
  render() {
    if (!this.props.weather || !this.props.limits) {
      return null;
    }
    const data = this.getData();
    const divider0m = new Moment().startOf('day');
    const divider1m = new Moment().startOf('day').add(1, 'day');
    const divider2m = new Moment().startOf('day').add(2, 'day');
    const divider0 = divider0m.valueOf();
    const divider1 = divider1m.valueOf();
    const divider2 = divider2m.valueOf();

    return (
      <div className="yr-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            isAnimationActive={false}
            margin={{
              top: 10, right: 20, left: 30, bottom: 10,
            }}
            data={data}
          >
            <XAxis scale="time" dataKey="time" tickFormatter={formatTick} ticks={getTicks()} interval={3} type="number" domain={['dataMin', 'dataMax']} allowDataOverflow />
            <YAxis
              width={25}
              yAxisId="temp"
              type="number"
              ticks={this.props.limits.ticks}
              domain={[this.props.limits.lowerRange, this.props.limits.upperRange]}
            />
            <YAxis
              width={25}
              yAxisId="rain"
              allowDataOverflow
              ticks={[3, 6, 9]}
              type="number"
              orientation="right"
              domain={[0, 9]}
            />
            <CartesianGrid stroke={gridColor} strokeDasharray="1 2" vertical={false} />
            { this.props.limits.lowerRange < 0 && <ReferenceArea y1={0} y2={this.props.limits.lowerRange} yAxisId="temp" stroke={null} fill="#0000FF" fillOpacity="0.2" /> }
            <Area dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rain" stroke="#8884d8" />
            <Line dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rainMin" stroke="#8884d8" strokeDasharray="2 2" />
            <Line dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rainMax" stroke="#8884d8AA" strokeDasharray="2 2" />
            <Line
              dot={<WeatherIcon symbolMap={symbolMap} sunrise={this.props.limits.sunrise} sunset={this.props.limits.sunset} />}
              yAxisId="temp"
              type="natural"
              dataKey="temp"
              stroke="#ffffffaa"
              strokeWidth={0.5}
            />
            <ReferenceLine
              yAxisId="temp"
              x={divider0}
              stroke={gridColor}
              strokeDasharray="0 0"
              label={{ value: divider0m.format('dddd'), fill: gridColor, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              yAxisId="temp"
              x={divider1}
              stroke={gridColor}
              strokeDasharray="5 0"
              label={{ value: divider1m.format('dddd'), fill: gridColor, position: 'insideTopLeft' }}
            />
            <ReferenceLine
              yAxisId="temp"
              x={divider2}
              stroke={gridColor}
              strokeDasharray="5 0"
              label={{ value: divider2m.format('dddd'), fill: gridColor, position: 'insideTopLeft' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 10, margin: 0, paddingTop: 0, color: 'white',
        }}
        >
          <label htmlFor="oslo">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="oslo"
              name="sted"
              value="oslo"
              checked={this.state.sted === 'oslo'}
              onChange={val => this.stedEndra(val)}
            />
            Hjemme
          </label>
          <label htmlFor="sandefjord">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="sandefjord"
              name="sted"
              value="sandefjord"
              checked={this.state.sted === 'sandefjord'}
              onChange={val => this.stedEndra(val)}
            />
            Hytta
          </label>
        </div>
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

function formatTick(data) {
  const time = Moment(data, 'x');
  return time.format('HH');
}

Yr.defaultProps = {
  weather: undefined,
  limits: undefined,
};

Yr.propTypes = {
  weather: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  limits: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    weather: state.Weather.weather,
    limits: state.Weather.limits,
  };
};

export default connect(mapStateToProps)(Yr);
