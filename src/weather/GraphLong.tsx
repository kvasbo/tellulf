import React from 'react';
import Moment from 'moment';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Area,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import { parseLimits } from './updateWeather';
import WeatherIcon from './WeatherIcon';
import symbolMap from './symbolMap';
import { WeatherData } from '../types/weather';
import { formatTick } from './weatherHelpers';
import './yr.css';

const gridColor = '#FFFFFF33';

interface Props {
  weather: WeatherData[];
  from: Moment.Moment;
  to: Moment.Moment;
  sted: string;
}

interface State {
  currentTime: number;
}

class GraphLong extends React.PureComponent<Props, State> {
  public state: State;

  public static defaultProps = {
    limits: undefined,
  };

  public constructor(props: Props) {
    super(props);
    this.state = { currentTime: Moment().valueOf() };
  }

  public componentDidMount() {
    setInterval(() => this.reloadTime(), 60000); // Reload time every minute
  }

  private reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  // Stays on
  public render() {
    const data = this.props.weather;
    if (data.length === 0) return null;
    const limits = parseLimits(data);
    const startTime = this.props.from.valueOf();
    const endTime = this.props.to.valueOf();
    return (
      <ResponsiveContainer height={200} width="100%">
        <ComposedChart
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
          data={data}
        >
          <XAxis
            scale="time"
            dataKey="time"
            type="number"
            tickFormatter={formatTick}
            domain={[startTime, endTime]}
            allowDataOverflow
          />
          <YAxis
            width={25}
            yAxisId="temp"
            type="number"
            ticks={limits.ticks}
            domain={[limits.lowerRange, limits.upperRange]}
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
              position: 'left',
            }}
            yAxisId="rain"
            allowDataOverflow
            type="number"
            orientation="right"
            domain={[0, dataMax => Math.max(9, dataMax)]}
            hide
          />
          <CartesianGrid stroke={gridColor} vertical={false} />
          {limits.lowerRange < 0 && (
            <ReferenceArea
              y1={0}
              y2={limits.lowerRange}
              yAxisId="temp"
              stroke="#00000000"
              fill="#0000FF"
              fillOpacity="0.35"
            />
          )}
          <Area
            dot={false}
            yAxisId="rain"
            connectNulls={false}
            type="natural"
            dataKey="rain"
            stroke="#8884d8"
            isAnimationActive={false}
          />
          <Line
            dot={false}
            yAxisId="rain"
            connectNulls={false}
            type="natural"
            dataKey="rainMin"
            stroke="#8884d8"
            strokeDasharray="2 2"
            isAnimationActive={false}
          />
          <Line
            dot={false}
            yAxisId="rain"
            connectNulls={false}
            type="natural"
            dataKey="rainMax"
            stroke="#8884d8AA"
            strokeDasharray="2 2"
            isAnimationActive={false}
          />
          <Line
            dot={false}
            yAxisId="wind"
            connectNulls={false}
            type="natural"
            dataKey="wind"
            stroke="#ffffff77"
            strokeDasharray="3 5"
            isAnimationActive={false}
          />
          <Line
            dot={
              <WeatherIcon symbolMap={symbolMap} sunrise={limits.sunrise} sunset={limits.sunset} />
            }
            yAxisId="temp"
            type="natural"
            dataKey="temp"
            stroke="#ffffff"
            opacity={0.5}
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
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}

export default GraphLong;
