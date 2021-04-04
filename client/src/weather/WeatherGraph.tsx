import Moment from 'moment';
import React from 'react';
import {
  Area,
  ComposedChart,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { HourForecast, WeatherDataSeries, WeatherLimits } from '../types/forecast';
import { formatTick } from './weatherHelpers';
import WeatherIcon from './WeatherIcon';

interface Props {
  weather: WeatherDataSeries;
  date: Moment.Moment;
  from: Moment.Moment;
  to: Moment.Moment;
  sted: string;
  showPlace: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick: Function;
  limits: WeatherLimits;
  weatherUpdated: Moment.Moment;
}

const colors = {
  grid: '#FFFFFF33',
  rain: '#ffffff',
  temperature: '#FFFFFF88',
  updated: '#FFFFFF22',
};

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
    const startTime = this.props.date.startOf('day').valueOf();
    const endTime = this.props.date.endOf('day').valueOf();
    const weather: HourForecast[] = Object.values(this.props.weather);
    return (
      <ResponsiveContainer height={200} width="100%">
        <ComposedChart
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
          data={weather}
          onClick={() => this.props.onClick()}
        >
          <XAxis
            scale="time"
            dataKey="time"
            type="number"
            tickFormatter={formatTick}
            domain={[startTime, endTime]}
            allowDataOverflow={true}
          />
          <YAxis
            width={25}
            yAxisId="temp"
            type="number"
            domain={[this.props.limits.lowerRange, this.props.limits.upperRange]}
            hide
          />
          {false && (
            <YAxis
              width={25}
              yAxisId="rain"
              allowDataOverflow
              type="number"
              orientation="right"
              domain={[0, 1.5]}
              hide
            />
          )}
          {false && (
            <Area
              dot={false}
              yAxisId="rain"
              connectNulls={true}
              type="natural"
              dataKey="rain"
              stroke={colors.rain}
              fillOpacity="0.15"
              fill="#ffffff"
              isAnimationActive={false}
            />
          )}

          {false && (
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
          )}

          {false && (
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
          )}

          <Line
            dot={<WeatherIcon forecast={weather} />}
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
