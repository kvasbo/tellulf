import React from 'react';
import Moment from 'moment';
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
  Label,
} from 'recharts';

import './solceller.css';

import {
  getMaxSunHeight,
  getEnergyScaleMax,
  getSunForTime,
  formatEnergyScaleTick,
  getDataPointObject,
  getXAxis,
  getXTicks,
  formatTick,
} from './energyHelpers';

import { SolarCurrent, SolarMax, SolarHour } from '../types/solar';
import { InitState } from '../types/initstate';
import { PowerPriceState, TibberRealtimeState, TibberUsageState } from '../types/tibber';

const maxSunHeight = getMaxSunHeight();

interface Props {
  currentSolarProduction: SolarCurrent;
  powerPrices: PowerPriceState;
  latitude: number;
  longitude: number;
  usedPower: TibberUsageState;
  realtimePower: TibberRealtimeState;
  initState: InitState;
  max: SolarMax;
  currentNetConsumption: number;
}

export interface EnergyGraphDataSet {
  [s: string]: {
    time: number;
    price: number | null;
    sun: number | null;
    sunInAWeek: number | null;
    sunInTwoWeeks: number | null;
    sunInAMonth: number | null;
    production: number | null;
    consumption: number | null;
  };
}

interface State {
  currentTime: number;
}

class EnergyGraph extends React.PureComponent<Props, State> {
  public state: State;
  private interval = 0;

  public constructor(props: Props) {
    super(props);
    this.state = {
      currentTime: Moment().valueOf(),
    };
  }

  public componentDidMount() {
    this.interval = window.setInterval(() => {
      this.reloadTime();
    }, 300000); // Flytt sola hvert femte minutt
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  private getData() {
    const dataSet: EnergyGraphDataSet = getDataPointObject();
    const dstAdd = Moment().isDST() ? 3600000 : 0;
    const timeZoneAdd = 3600000;
    const now = new Date();

    // Map production data
    this.props.currentSolarProduction.byHour.forEach((h: SolarHour) => {
      // Correct production time for UTC
      const correctedTime = h.time + timeZoneAdd + dstAdd;
      if (correctedTime in dataSet) {
        dataSet[correctedTime].production = h.production / 1000;
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
        dataSet[h.time].sunInAWeek = getSunForTime(
          inAWeek,
          this.props.latitude,
          this.props.longitude,
        );
        dataSet[h.time].sunInTwoWeeks = getSunForTime(
          inTwoWeeks,
          this.props.latitude,
          this.props.longitude,
        );
        dataSet[h.time].sunInAMonth = getSunForTime(
          inAMonth,
          this.props.latitude,
          this.props.longitude,
        );

        // Consumption
        if (hour < now) {
          if (hr in this.props.usedPower) {
            const usage = this.props.usedPower[hr];
            const kwh = Number(usage.consumption);
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

  private reloadTime() {
    this.setState({ currentTime: Moment().valueOf() });
  }

  public render() {
    if (!this.props.initState.powerPrices || !this.props.initState.solar) return null;

    // const dataAge = this.props.current.dataTime.diff(Moment(), 'seconds');
    // const textColor = (dataAge < 120) ? '#FFFFFF' : '#FF0000'; // Rød tekst om data er over to minutter gamle
    const data = this.getData();

    return (
      <div
        style={{
          height: '12vh',
          width: '100%',
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
            {false && (
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
            )}
            <YAxis
              width={10}
              yAxisId="kwh"
              type="number"
              tickFormatter={formatEnergyScaleTick}
              domain={[0, getEnergyScaleMax]}
            >
              {false && (
                <Label
                  angle={-90}
                  value="kw"
                  stroke="#ffffff55"
                  fill="#ffffff55"
                  fontSize={15}
                  position="insideTop"
                />
              )}
            </YAxis>
            <YAxis
              width={0}
              yAxisId="sun"
              hide
              allowDataOverflow
              ticks={[]}
              type="number"
              orientation="right"
              domain={[0, maxSunHeight]}
            />
            {false && (
              <Line
                yAxisId="price"
                dot={false}
                type="step"
                connectNulls
                dataKey="price"
                stroke="#8884d8"
              />
            )}
            <Line dot={false} yAxisId="sun" type="basis" dataKey="sun" stroke="#FFFFFF88" />
            <Line dot={false} yAxisId="sun" type="basis" dataKey="sunInAWeek" stroke="#FFFFFF55" />
            <Line
              dot={false}
              yAxisId="sun"
              type="basis"
              dataKey="sunInTwoWeeks"
              stroke="#FFFFFF33"
            />
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
            {false && <CartesianGrid stroke="#FFFFFF55" strokeDasharray="1 2" vertical={false} />}
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
              r={4}
              label={''}
            />
            {false && this.props.currentNetConsumption && this.props.currentNetConsumption > 0 && (
              <ReferenceDot
                yAxisId="kwh"
                y={this.props.currentNetConsumption / 1000}
                x={this.props.currentSolarProduction.currentTime.valueOf()}
                r={3}
                fill="#ffffff44"
                stroke="#ffffff"
                label={''}
              >
                <Label
                  value={`${Number(this.props.currentNetConsumption).toLocaleString()}`}
                  stroke="#FF0000"
                  fill="#FF0000"
                  fontSize={35}
                  position="left"
                />
              </ReferenceDot>
            )}
            {false && this.props.currentSolarProduction.now > 0 && (
              <ReferenceDot
                yAxisId="kwh"
                label={''}
                y={this.props.currentSolarProduction.now / 1000}
                x={this.props.currentSolarProduction.currentTime.valueOf()}
                r={3}
                fill="#ffffff44"
                stroke="#ffffff"
              >
                <Label
                  value={`${Number(
                    this.props.currentSolarProduction.averageMinute,
                  ).toLocaleString()}`}
                  stroke="#00FF00"
                  fill="#00FF00"
                  fontSize={35}
                  position="right"
                />
              </ReferenceDot>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default EnergyGraph;
