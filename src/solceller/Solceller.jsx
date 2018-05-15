import React, { Component } from 'react';
import Moment from 'moment';
import axios from 'axios';
import { XAxis, YAxis, Area, Line, AreaChart, ReferenceLine, ReferenceDot, ComposedChart } from 'recharts';
import './style.css';

const nettleie = 0.477;

export default class Solceller extends Component {
  constructor(props) {
    super(props);
    this.state = {
      now: null,
      today: null,
      month: null,
      year: null,
      total: null,
      maxDay: null,
      currentTime: Moment().valueOf(),
      byHour: null,
      averageFull: 0,
      powerPrices: [],
    };
  }

  componentDidMount() {
    setInterval(() => this.getPowerPrice(), 60 * 60 * 1000);
    this.getPowerPrice();
    this.attachMaxListeners();
    const dbRef = window.firebase.database().ref('steca/currentData');
    dbRef.on('value', (snapshot) => {
      try {
        const val = snapshot.val();
        const now = (typeof val.effect.val !== 'undefined') ? val.effect.val : null;
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

  async attachMaxListeners() {
    const now = Moment();
    const y = now.format("YYYY");
    const m = now.format("MM");
    const d = now.format("DD");
    const h = now.format("HH");
    const refHour = `steca/maxValues/hourly/${y}/${m}/${d}/${h}`;
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = `steca/maxValues/ever/`;

    const dbRefDayMax = window.firebase.database().ref(refDay);
    dbRefDayMax.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && val.value) {
          this.setState({ maxDay: val.value });
        }
        
    });

  }

  async getPowerPrice() {
    try {
      const data = await axios({
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: {'Authorization': "bearer" + '1a3772d944bcf972f1ee84cf45d769de1c80e4f0173d665328287d1e2a746004'},
        data: {
          query: `
            {viewer {homes {currentSubscription {priceInfo {today {total energy tax startsAt }}}}}}
            `,
        },
      });
      if (data.status === 200) {
        // console.log(data.data.data.viewer.homes[0].currentSubscription.priceInfo.today);
        const prices = data.data.data.viewer.homes[0].currentSubscription.priceInfo.today;
        const powerPrices = prices.map((p) => {
          return { price: p.total + nettleie, time: Moment(p.startsAt).valueOf() };
        });
        this.setState({ powerPrices });
      }
    } catch (err) {
      console.log(err);
    }
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

  getData() {
    if (!this.state.byHour) return null;
    const dataSet = getDataPointObject();
    // Map production data
    this.state.byHour.forEach((h) => {
      if (h.time in dataSet) {
        dataSet[h.time].production = h.production;
      }
    });
    this.state.powerPrices.forEach((h) => {
      if (h.time in dataSet) {
        dataSet[h.time].price = h.price;
      }
    });
    return Object.values(dataSet);
  }

  render() {
    if (!this.getData()) return null;
    return (
      <div>
        <div>
          <ComposedChart
            margin={{
              top: 30,
              right: 20,
              left: 30,
              bottom: 10,
            }}
            width={540}
            height={280}
            data={this.getData()}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#bf2a2a" stopOpacity={1} />
                <stop offset="80%" stopColor="#bf2a2a" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" type="number" tickFormatter={formatTick} ticks={getXTicks()} domain={['dataMin', 'dataMax']} />
            <YAxis yAxisId="price" mirror ticks={[0.25, 0.5, 0.75, 1.0, 1.25, 1.5]} orientation="right" type="number" domain={[0, 1.5]} />
            <YAxis yAxisId="kwh" mirror ticks={[1000, 2000, 3000, 4000]} type="number" tickFormatter={formatYTick} domain={[0, 4500]} />
            <Line yAxisId="price" dot={false} type="monotone" connectNulls dataKey="price" stroke="#8884d8" />
            <Area yAxisId="kwh" dot={false} type="monotone" dataKey="production" stroke="#bf2a2a" fillOpacity={1} fill="url(#colorUv)" />
            <ReferenceLine yAxisId="kwh" y={this.state.averageFull} stroke="#FFFFFF" strokeDasharray="3 3" />
            <ReferenceLine
              yAxisId="kwh"
              y={this.state.maxDay}
              stroke="#FFFF0088"
              label={{
                value: `${this.state.maxDay}W`,
                stroke: '#ffffff77',
                fill: '#ffffff77',
                fontSize: 12,
                position: "top",
              }}
              strokeDasharray="3 3" />
            <ReferenceDot
              yAxisId="kwh"
              label={{
                value: `${this.state.now}W`,
                stroke: 'white',
                fill: 'white',
                fontSize: 55,
                position: this.getCurrentLabelPosition(),
              }}
              y={this.state.now}
              x={this.state.currentTime}
              r={3}
              fill="#ffffff44"
              stroke="#ffffff"
            />
          </ComposedChart>
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

function getXTicks() {
  const time = Moment().startOf('day');
  const out = [];
  for (let i = 0; i < 24; i += 2) {
    const t = Moment(time).add(i, 'hours');
    out.push(t.valueOf());
  }
  return out;
}

function formatTick(data) {
  const time = Moment(data).local();
  return time.format('HH');
}

function formatYTick(data) {
  return `${Math.round(data / 1000)}KW`;
}
