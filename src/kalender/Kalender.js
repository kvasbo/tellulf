import React from 'react';
import Moment from 'moment';
import Axios from 'axios';
import { connect } from 'react-redux';
import Dag from './Dag';

const IcalExpander = require('ical-expander');

const calUrl = 'https://calendar.google.com/calendar/ical/kvasbo.no_ognucfh1asvpgc50mqms5tu0kk%40group.calendar.google.com/private-7020f002efde8095cc911279983fb92a/basic.ics'

const dinnerUrl = 'https://calendar.google.com/calendar/ical/kvasbo.no_m3le0buqs8k24ljlumcr1goqqs%40group.calendar.google.com/private-43f7d258dce12c6117d133b621318148/basic.ics';

// const cal = encodeURIComponent(calUrl);
// const dinner = encodeURIComponent(dinnerUrl);

// const proxy = 'http://192.168.1.5:3333';
const proxy2 = 'https://cors-anywhere.herokuapp.com';

const calP = `${proxy2}/${calUrl}`;
const dinP = `${proxy2}/${dinnerUrl}`;

class Kalender extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      kalenderData: {},
      dinners: {},
    };
  }

  componentDidMount() {
    this.updateData();
    setInterval(() => this.updateData(), 1000 * 60);
  }

  async updateData() {
    try {
      const kalenderData = await this.getIcal(calP, true);
      const dinners = await this.getIcal(dinP, false);
      this.setState({ kalenderData, dinners });
    } catch (err) {
      console.log(err);
    }
  }

  async getIcal(url, prime = false) {
    const parsedEvents = {};
    try {
    const now = Moment();
    const data = await Axios.get(url);

    if (data.status !== 200) throw Error('Couldnt fetch calendar data');

    const icalExpander = new IcalExpander({ ics: data.data, maxIterations: 1000 });
    const events = icalExpander.between(now.toDate(), now.add(60, 'days').toDate());

    const sorted = {};

    sorted.events = events.events.sort((a, b) => {
      const start = a.startDate.toJSDate();
      const end = b.startDate.toJSDate();
      return start - end;
    });

    sorted.occurrences = events.occurrences.sort((a, b) => {
      const start = a.item.startDate.toJSDate();
      const end = b.item.startDate.toJSDate();
      return start - end;
    });

    // Prime array for events.
    if (prime) {
      for (let i = 0; i < 7; i += 1) {
        const m = new Moment();
        m.add(i, 'day');
        const s = m.format('YYYY-MM-DD');
        parsedEvents[s] = initDay(s);
      }
    }

    sorted.occurrences.forEach((e) => {
      try {
        const event = this.parseIcalEvent(e, true);
        if (!parsedEvents[event.groupString]) {
          parsedEvents[event.groupString] = initDay(event.groupString);
        } 
        parsedEvents[event.groupString].events.push(event);
      } catch (err) {
        console.log(err);
      }
    });

    sorted.events.forEach((e) => {
      try {
        const event = this.parseIcalEvent(e, false);
        if (!parsedEvents[event.groupString]) {
          parsedEvents[event.groupString] = initDay(event.groupString);
        }
        parsedEvents[event.groupString].events.push(event);
      } catch (err) {
        console.log(err);
      }
    });
    } catch (err) {
      console.log(err);
    }

    return parsedEvents;
  }

  parseIcalEvent(e, useItem = false) {
    try {
      const now = Moment();
      const start = Moment(e.startDate.toJSDate());
      const end = Moment(e.endDate.toJSDate());
      const name = (useItem) ? e.item.summary : e.summary;

      const fullDay = (e.startDate.hour === 0) && (e.endDate.hour === 0) && (e.endDate.day !== e.startDate.day);

      let oneDay = true;
      if (fullDay) {
        if (Moment(end).subtract(1, 'day').startOf('day').isAfter(Moment(start).startOf('day'))) oneDay = false;
      }

      if (!fullDay) {
        if (!start.isSameOrBefore(Moment(end).endOf('day'), 'day')) oneDay = false;
      }

      let groupString = start.format('YYYY-MM-DD');
      const startsBeforeToday = start.isBefore(now, 'day');
      if (startsBeforeToday) {
        groupString = now.format('YYYY-MM-DD');
      }
      const id = (e.uid) ? e.uid : e.item.uid;
      return { id, name, start, end, fullDay, oneDay, groupString };
    } catch (err) {
      console.log(err);
    }
  }

  getWeather(day) {
    if (!this.props.weather) return [];
    const from = Moment(day).startOf('day').valueOf();
    const to = Moment(day).endOf('day').valueOf();
    return Object.values(this.props.weather).filter((w) => {
      return (w.time >= from && w.time <= to);
    });
  }

  getDays() {
    const out = [];
    const data = Object.values(this.state.kalenderData).sort((a, b) => {
      return a.sortStamp - b.sortStamp;
    });
    data.forEach((d) => {
      const weather = this.getWeather(d.sortString);
      out.push(<Dag key={d.sortStamp} date={d.sortString} weather={weather} events={d} dinner={this.state.dinners[d.sortStamp]} />);
    });
    return out;
  }

  render() {
    return (
      <div style={{ flex: 1 }}>
       {this.getDays()}
      </div>
    );
  }
}

function initDay(sortString) {
  return { events: [], sortString, sortStamp: parseInt(Moment(sortString, "YYYY-MM-DD").format('x'), 10) }
}

const mapStateToProps = state => {
  return {
    weather: state.Weather.long,
  };
}

export default connect(mapStateToProps)(Kalender);
