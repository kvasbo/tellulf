import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Area,
  Label,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  RechartsFunction,
} from 'recharts';
import sortBy from 'lodash/sortBy';
import maxBy from 'lodash/maxBy';
import WeatherIcon from './WeatherIcon';
import { HourForecast, ForecastStore } from '../types/forecast';
import { AppStore } from '../redux/reducers';
import { formatTick } from './weatherHelpers';
import './yr.css';

const colors = {
  grid: '#FFFFFF33',
  cold: '#0000FF44',
  rain: '#8884d8',
  temperature: '#FF000088',
};

interface Props {
  weather: HourForecast[];
  date: Moment.Moment;
  from: Moment.Moment;
  to: Moment.Moment;
  sted: string;
  showPlace: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick: Function;
  forecast: ForecastStore;
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
    onClick: () => {
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

  private filterForecast(date: Moment.Moment, sted: string): HourForecast[] {
    if (!this.props.forecast.data || !this.props.forecast.data[this.props.sted]) return [];
    const from = Moment(date).startOf('day').subtract(6, 'h');
    const to = Moment(date).endOf('day').add(6, 'h');

    const weather = this.props.forecast.data[sted].forecast;

    const weatherFiltered: HourForecast[] = Object.values(weather).filter((w: HourForecast) => {
      return Moment(w.time).isBetween(from, to, undefined, '[]');
    });

    const weatherSorted: HourForecast[] = sortBy(weatherFiltered, 'time');

    return weatherSorted;
  }

  // Stays on
  public render(): React.ReactNode {
    const weather = this.filterForecast(this.props.date, this.props.sted);
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
          data={this.props.weather}
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
            ticks={this.props.forecast.limits.ticks}
            domain={[this.props.forecast.limits.lowerRange, this.props.forecast.limits.upperRange]}
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
          {this.props.forecast.limits.lowerRange < 0 && (
            <ReferenceArea
              y1={0}
              y2={this.props.forecast.limits.lowerRange}
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
          {this.props.showPlace && <Label value={this.props.sted} />}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    forecast: state.Forecast,
  };
}

export default connect(mapStateToProps)(WeatherGraph);
