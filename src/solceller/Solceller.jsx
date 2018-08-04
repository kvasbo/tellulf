import React, { Component } from 'react';
import Moment from 'moment';
import { connect } from 'react-redux';
import axios from 'axios';
import { XAxis, YAxis, Area, Line, ReferenceLine, ReferenceDot, ComposedChart, ResponsiveContainer } from 'recharts';
import { updateSolarMax, updateSolarCurrent, updatePowerPrices } from '../redux/actions';
import './style.css';

const nettleie = 0.477;

class Solceller extends Component {
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
        const averageMinute = (typeof val.averages['1'] !== 'undefined') ? val.averages['1'] : null;
        // const averageShort = (typeof val.averages.short !== 'undefined') ? val.averages.short : null;
        const byHour = (typeof val.todayByHour.val !== 'undefined') ? parseByHour(val.todayByHour.val) : null;
        const currentTime = Moment().valueOf();
        const state = {
          now, today, month, year, total, byHour, currentTime, averageFull, averageMinute,
        };
        this.props.dispatch(updateSolarCurrent(state));
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
    // const h = now.format("HH");
    // const refHour = `steca/maxValues/hourly/${y}/${m}/${d}/${h}`;
    const refDay = `steca/maxValues/daily/${y}/${m}/${d}`;
    const refMonth = `steca/maxValues/monthly/${y}/${m}`;
    const refYear = `steca/maxValues/yearly/${y}`;
    const refEver = `steca/maxValues/ever/`;

    const dbRefDayMax = window.firebase.database().ref(refDay);
    dbRefDayMax.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxDay: val.value }
          this.props.dispatch(updateSolarMax(state));
        }
    });

    const dbRefMonthMax = window.firebase.database().ref(refMonth);
    dbRefMonthMax.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxMonth: val.value }
          this.props.dispatch(updateSolarMax(state));
        }
    });

    const dbRefYearMax = window.firebase.database().ref(refYear);
    dbRefYearMax.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxYear: val.value }
          this.props.dispatch(updateSolarMax(state));
        }
    });

    const dbRefEverMax = window.firebase.database().ref(refEver);
    dbRefEverMax.on('value', (snapshot) => {
        const val = snapshot.val();
        if (val && val.value) {
          const state = { maxEver: val.value }
          this.props.dispatch(updateSolarMax(state));
        }
    });

  }

  async getPowerPrice() {
    try {
      const data = await axios({
        url: 'https://api.tibber.com/v1-beta/gql',
        method: 'post',
        headers: { Authorization: 'bearer 1a3772d944bcf972f1ee84cf45d769de1c80e4f0173d665328287d1e2a746004' },
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
          return { total: p.total + nettleie, nettleie, power: p.total, time: Moment(p.startsAt).valueOf() };
        });
        this.props.dispatch(updatePowerPrices(powerPrices));
      }
    } catch (err) {
      console.log(err);
    }
  }

  getCurrentLabelPosition() {
    if (this.props.current.averagefull > 3300) {
      return 'bottom';
    }
    return 'top';
  }

  showProdToday() {
    return getRoundedNumber(Number(this.props.current.today) / 1000);
  }

  showProdMonth() {
    return getRoundedNumber(parseFloat(this.props.current.month) / 1000);
  }

  showProdYear() {
    return getRoundedNumber(parseFloat(this.props.current.year) / 1000);
  }

  showProdTotal() {
    return getRoundedNumber(parseFloat(this.props.current.total) / 1000);
  }

  getData() {
    if (!this.props.current.byHour) return null;
    const dataSet = getDataPointObject();
    // Map production data
    this.props.current.byHour.forEach((h) => {
      if (h.time in dataSet) {
        dataSet[h.time].production = h.production;
      }
    });
    this.props.powerPrices.forEach((h) => {
      if (h.time in dataSet) {
        dataSet[h.time].price = h.total;
      }
    });
    return Object.values(dataSet);
  }

  getProductionForHour(hour) {
    const start = Moment().hour(hour).startOf('hour');
    const end = Moment().hour(hour).endOf('hour');

    const samplesForHour = this.props.current.byHour.filter((h) => {
      return Moment(h.time).isBetween(start, end);
    });

    let sum = 0;
    samplesForHour.forEach((h) => {
      sum += h.production;
    });

    return sum / samplesForHour.length;
  }

  getMoneySavedToday() {
    try {
      let sum = 0;
      for (let i = 0; i < 24; i += 1) {
        const production = this.getProductionForHour(i);
        const price = this.props.powerPrices[i];
        const savedThisHour = (production * price.total) / 1000;
        sum += savedThisHour;
        // console.log(i, production, price.total, savedThisHour);
      }
      return Math.round(sum, 2);
    } catch (err) {
      console.log(err);
      return '?';
    }
  }

  render() {
    if (!this.getData()) return null;
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              margin={{
                top: 30,
                right: 20,
                left: 30,
                bottom: 10,
              }}
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
              <ReferenceLine
                yAxisId="kwh"
                y={this.props.current.averageFull}
                stroke="#FFFFFF"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                yAxisId="kwh"
                y={this.props.max.maxDay}
                stroke="#FFFF0055"
                strokeDasharray="3 3" />
              <ReferenceDot
                yAxisId="kwh"
                y={this.props.current.now}
                x={this.props.current.currentTime}
                r={3}
                fill="#ffffff44"
                stroke="#ffffff"
                label={{
                  value: `${this.props.current.averageMinute}W`,
                  stroke: 'white',
                  fill: 'white',
                  fontSize: 50,
                  position: this.getCurrentLabelPosition(),
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          color: 'white',
          padding: 0,
          height: 50,
          }}
        >
          <div>Dag: {this.showProdToday()} kWh / {this.getMoneySavedToday()} kr</div>
          <div>Måned: {this.showProdMonth()}</div>
          <div>År: {this.showProdYear()}</div>
          <div>Total: {this.showProdTotal()}</div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    current: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
  };
}

export default connect(mapStateToProps)(Solceller);

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
