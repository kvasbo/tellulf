import React from 'react';
import { connect } from 'react-redux';
import sortBy from 'lodash/sortBy';
import uniqBy from 'lodash/uniqBy';
import Moment from 'moment';
import {
  ComposedChart, Line, XAxis, YAxis, ResponsiveContainer, Area, CartesianGrid, ReferenceLine, ReferenceArea, Label
} from 'recharts';
import { getTimeLimits, parseLimits } from './updateWeather';
import WeatherIcon from './WeatherIcon';
import symbolMap from './symbolMap';
import { getNorwegianDaysOff } from '../external';
import { AppStore } from '../redux/reducers';
import './yr.css';

const gridColor = '#FFFFFFAA';
const sundayColor = '#FF0000CC';
const redDays = getNorwegianDaysOff();

interface props {
  weatherLong: object;
  limits: any;
}

interface state {
  currentTime: number;
}

class GraphLong extends React.PureComponent<props, {}> {
  state: state;

  public static defaultProps = {
    limits: undefined,
  }

  constructor(props: props) {
    super(props);
    this.state = { currentTime: Moment().valueOf() };
  }

  getData() {
    const rawData = Object.values(this.props.weatherLong);
    const uniqueData = uniqBy(rawData, 'time');
    const sortedData = sortBy(uniqueData, 'time');
    return sortedData;
  }

  reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  // Stays on
  render() {
    if (!this.props.weatherLong || !this.props.limits) {
      return null;
    }
    const data = this.getData();
    const limits = parseLimits(data);
    const startTime = Moment().startOf('day').valueOf();
    const endTime = Moment().startOf('day').add(7, 'day').valueOf();
    const divider0m = Moment().startOf('day');
    const divider1m = Moment().startOf('day').add(1, 'day');
    const divider2m = Moment().startOf('day').add(2, 'day');
    const divider3m = Moment().startOf('day').add(3, 'day');
    const divider4m = Moment().startOf('day').add(4, 'day');
    const divider5m = Moment().startOf('day').add(5, 'day');
    const divider6m = Moment().startOf('day').add(6, 'day');
    const divider0 = divider0m.valueOf();
    const divider1 = divider1m.valueOf();
    const divider2 = divider2m.valueOf();
    const divider3 = divider3m.valueOf();
    const divider4 = divider4m.valueOf();
    const divider5 = divider5m.valueOf();
    const divider6 = divider6m.valueOf();

    return (
      <div className="yr-container">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            margin={{
              top: 0, right: 10, left: 10, bottom: 0,
            }}
            data={data}
          >
            <XAxis scale="time" dataKey="time" tickFormatter={formatTick} ticks={getTicks()} type="number" domain={[startTime, endTime]} allowDataOverflow />
            <YAxis
              width={25}
              yAxisId="temp"
              type="number"
              ticks={limits.ticks}
              domain={[limits.lowerRange, limits.upperRange]}
            />
            <YAxis
              yAxisId="wind"
              type="number"
              ticks={[null]}
              domain={[0, 50]}
              hide
            />
            <YAxis
              yAxisId="clouds"
              type="number"
              ticks={[null]}
              domain={[0, 1]}
              hide
            />
            <YAxis
              width={25}
              label={{
                angle: 90,
                value: 'mm',
                stroke: '#ffffff55',
                fill: '#ffffff55',
                fontSize: 15,
                position: 'right',
              }}
              yAxisId="rain"
              allowDataOverflow
              ticks={[3, 6, 9]}
              type="number"
              orientation="right"
              domain={[0, 9]}
            />
            <CartesianGrid stroke={gridColor} strokeDasharray="1 2" vertical={false} />
            { limits.lowerRange < 0 && <ReferenceArea y1={0} y2={limits.lowerRange} yAxisId="temp" stroke="#00000000" fill="#0000FF" fillOpacity="0.35" /> }
            <Area dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rain" stroke="#8884d8" isAnimationActive={false} />
            <Line dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rainMin" stroke="#8884d8" strokeDasharray="2 2" isAnimationActive={false} />
            <Line dot={false} yAxisId="rain" connectNulls={false} type="natural" dataKey="rainMax" stroke="#8884d8AA" strokeDasharray="2 2" isAnimationActive={false} />
            <Line dot={false} yAxisId="wind" connectNulls={false} type="natural" dataKey="wind" stroke="#ffffff77" strokeDasharray="3 5" isAnimationActive={false} />
            <Line
              dot={<WeatherIcon symbolMap={symbolMap} sunrise={this.props.limits.sunrise} sunset={this.props.limits.sunset} />}
              yAxisId="temp"
              type="natural"
              dataKey="temp"
              stroke="#ffffffaa"
              strokeWidth={0.5}
              isAnimationActive={false}
            />
            <ReferenceLine
              yAxisId="temp"
              x={this.state.currentTime}
              stroke="#FF000088"
              strokeWidth={3}
              strokeDasharray="3 3"
            />
            <ReferenceLine
              yAxisId="temp"
              x={divider0}
              stroke="#00000000"
              strokeDasharray="1 0"
              >
                <Label value={divider0m.format('dddd')} fill={getDayColor(divider0m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              x={divider1}
              stroke={gridColor}
              strokeDasharray="2 2"
              >
                <Label value={divider1m.format('dddd')} fill={getDayColor(divider1m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              x={divider2}
              stroke={gridColor}
              strokeDasharray="2 2"
              >
                <Label value={divider2m.format('dddd')} fill={getDayColor(divider2m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              x={divider3}
              stroke={gridColor}
              strokeDasharray="2 2"
              >
                <Label value={divider3m.format('dddd')} fill={getDayColor(divider3m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              x={divider4}
              stroke={gridColor}
              strokeDasharray="2 2"
              >
                <Label value={divider4m.format('dddd')} fill={getDayColor(divider4m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              x={divider5}
              stroke={gridColor}
              strokeDasharray="2 2"
              >
                <Label value={divider5m.format('dddd')} fill={getDayColor(divider5m)} position='insideTopLeft' />
              </ReferenceLine>
            <ReferenceLine
              yAxisId="temp"
              y={0}
              stroke={gridColor}
              strokeDasharray="1 0"
            />
            <ReferenceLine
              yAxisId="temp"
              x={divider6}
              stroke={gridColor}
              strokeDasharray="2 2"
            >
              <Label value={divider6m.format('dddd')} fill={getDayColor(divider6m)} position='insideTopLeft' />
            </ReferenceLine>

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

function getTicks() {
  const { start, end } = getTimeLimits(7);
  const out = [];
  while (start.isSameOrBefore(end)) {
    if (start.hours() % 6 === 0) {
      out.push(start.valueOf());
    }
    start.add(1, 'hours');
  }
  return out;
}

function getDayColor(time: any) {
  const d = Moment(time);
  if (d.day() === 0 || d.day() === 6) return sundayColor;
  const dString = d.format('MMDD');
  if (redDays.includes(dString)) return sundayColor;
  return gridColor;
}

function formatTick(data: any) {
  const time = Moment(data, 'x');
  return time.format('HH');
}

const mapStateToProps = (state: AppStore) => {
  return {
    weatherLong: state.Weather.long,
    limits: state.Weather.limits,
  };
};

export default connect(mapStateToProps)(GraphLong);
