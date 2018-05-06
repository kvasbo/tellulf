import React, { Component } from 'react';
import Moment from 'moment';
import { XAxis, YAxis, Area, AreaChart, ReferenceLine, ReferenceDot } from 'recharts';
import './style.css';

export default class Solceller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      now: null,
      today: null,
      month: null,
      year: null,
      total: null,
      currentTime: Moment().valueOf(),
      byHour: null,
      averageFull: 0,
    };
  }

  componentDidMount() {
    const dbRef = window.firebase.database().ref('steca/currentData');

    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();
        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
        // if (now) this.addPowerSampleAndPrune(now);
        const today = (typeof val.today.val !== 'undefined') ? val.today.val : null;
        const month = (typeof val.month.val !== 'undefined') ? val.month.val : null;
        const year = (typeof val.year.val !== 'undefined') ? val.year.val : null;
        const total = (typeof val.total.val !== 'undefined') ? val.total.val : null;
        const averageFull = (typeof val.averages.full !== 'undefined') ? val.averages.full : null;
        // const averageShort = (typeof val.averages.short !== 'undefined') ? val.averages.short : null;
        const byHour = (typeof val.todayByHour.val !== 'undefined') ? parseByHour(val.todayByHour.val) : null;
        const currentTime = Moment().valueOf();
        this.setState({
          now, today, month, year, total, byHour, currentTime, averageFull,
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  getCurrentLabelPosition() {
    const side = (Moment().hour() < 18) ? 'right' : 'left';
    if (this.state.now > 3300) {
      return side;
    }
    return 'top';
  }

  showProdToday() {
    return getRoundedNumber(Number(this.state.today) / 1000);
  }

  showProdMonth() {
    return getRoundedNumber(parseFloat(this.state.month) / 1000);
  }

  showProdYear() {
    return getRoundedNumber(parseFloat(this.state.year) / 1000);
  }

  showProdTotal() {
    return getRoundedNumber(parseFloat(this.state.total) / 1000);
  }

  render() {
    return (
      <div>
        <div>
          <AreaChart
            margin={{
              top: 30,
              right: 20,
              left: 30,
              bottom: 10,
            }}
            width={540}
            height={280}
            data={this.state.byHour}
          >
            <XAxis dataKey="time" type="number" tickFormatter={formatTick} tickCount={25} interval={1} domain={['dataMin', 'dataMax']} />
            <YAxis mirror ticks={[1000, 2000, 3000, 4000]} type="number" tickFormatter={formatYTick} domain={[0, 4000]} />
            <Area dot={false} type="monotone" dataKey="production" stroke="#8884d8cc" fill="#8884d888" />
            <ReferenceLine y={this.state.averageFull} stroke="#FFFF00" strokeDasharray="3 3" />
            <ReferenceDot
              label={{
                value: `${this.state.now}W`,
                stroke: 'white',
                fill: 'white',
                fontSize: 55,
                position: this.getCurrentLabelPosition(),
              }}
              y={this.state.now}
              x={this.state.currentTime}
              r={6}
              fill="red"
              stroke="none"
            />
          </AreaChart>
        </div>
        <div style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          }}
        >
          <div>Dag: {this.showProdToday()}</div>
          <div>Måned: {this.showProdMonth()}</div>
          <div>År: {this.showProdYear()}</div>
          <div>Total: {this.showProdTotal()}</div>
        </div>
      </div>
    );
  }
}

function getRoundedNumber(number) {
  if (number < 10) {
    return number.toFixed(3);
  } else if (number < 100) {
    return number.toFixed(2);
  } else if (number < 1000) {
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

function formatTick(data) {
  const time = Moment(data).local();
  return time.format('HH');
}

function formatYTick(data) {
  return `${Math.round(data / 1000)}KW`;
}
