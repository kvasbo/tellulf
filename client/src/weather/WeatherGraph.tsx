import Moment from 'moment';
import React from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Label,
    Line,
    RechartsFunction,
    ReferenceArea,
    ReferenceLine,
    ResponsiveContainer,
    XAxis,
    YAxis
} from 'recharts';
import { WeatherDataSeries, WeatherLimits } from '../types/forecast';
import { formatTick } from './weatherHelpers';
import WeatherIcon from './WeatherIcon';
interface Props {
  weather: WeatherDataSeries;
  from: Moment.Moment;
  to: Moment.Moment;
  sted: string;
  showPlace: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick: Function;
  limits: WeatherLimits;
  weatherUpdated: Moment.Moment;
}

interface State {
  currentTime: number;
}

class WeatherGraph extends React.PureComponent<Props, State> {
  public state: State;
  private interval = 0;

  public static defaultProps = {
    limits: undefined,
    showPlace: false,
    onClick: (): null => {
      return null;
    },
  };

  public constructor(props: Props) {
    super(props);
    this.state = { currentTime: Moment().valueOf() };
  }

  public componentDidMount(): void {
    this.interval = window.setInterval(() => this.reloadTime(), 60000); // Reload time every minute
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.interval);
  }

  private reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  // Stays on
  public render(): React.ReactNode {
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
          data={Object.values(this.props.weather)}
          onClick={this.props.onClick as RechartsFunction}
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
            ticks={this.props.limits.ticks}
            domain={[this.props.limits.lowerRange, this.props.limits.upperRange]}
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
            domain={[0, 1.5]}
            hide
          />
          <CartesianGrid stroke={colors.grid} vertical={false} />
          {this.props.limits.lowerRange < 0 && (
            <ReferenceArea
              y1={0}
              y2={this.props.limits.lowerRange}
              yAxisId="temp"
              stroke="#00000000"
              fill={colors.cold}
            />
          )}
          <Area
            dot={false}
            yAxisId="rain"
            connectNulls={true}
            type="natural"
            dataKey="rain"
            stroke={colors.rain}
            fillOpacity="0.3"
            isAnimationActive={false}
          />
          <Line
            dot={false}
            yAxisId="rain"
            connectNulls={true}
            type="natural"
            dataKey="rainMin"
            stroke={colors.rain}
            strokeDasharray="2 2"
            isAnimationActive={false}
          />
          <Line
            dot={false}
            yAxisId="rain"
            connectNulls={true}
            type="natural"
            dataKey="rainMax"
            stroke={colors.rain}
            strokeDasharray="2 2"
            isAnimationActive={false}
          />
          <Line
            dot={<WeatherIcon />}
            yAxisId="temp"
            type="natural"
            dataKey="temp"
            stroke="#ffffff"
            opacity={0.5}
            strokeWidth={1}
            isAnimationActive={false}
            connectNulls={true}
          />
          <ReferenceLine
            yAxisId="temp"
            x={this.state.currentTime}
            stroke={colors.temperature}
            strokeWidth={3}
            strokeDasharray="3 3"
          />
          <ReferenceLine
            yAxisId="temp"
            x={this.props.weatherUpdated.valueOf()}
            stroke={colors.updated}
            strokeWidth={3}
            strokeDasharray="3 3"
          />
          {this.props.showPlace && <Label value={this.props.sted} />}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}

export default WeatherGraph;
