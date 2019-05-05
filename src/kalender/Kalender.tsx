import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import Axios from 'axios';
import { connect } from 'react-redux';
import Dag from './Dag';
import { AppStore } from '../redux/reducers';

const IcalExpander = require('ical-expander');

const proxy = 'https://us-central1-tellulf-151318.cloudfunctions.net/proxy';

const calUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_ognucfh1asvpgc50mqms5tu0kk%40group.calendar.google.com/private-7020f002efde8095cc911279983fb92a/basic.ics';

const dinnerUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_m3le0buqs8k24ljlumcr1goqqs%40group.calendar.google.com/private-43f7d258dce12c6117d133b621318148/basic.ics';

const birthdayUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_upelraeuo31neuoq31f9decudg%40group.calendar.google.com/private-6718a3a9f7b74d60372a3f2be75804d6/basic.ics';

const cal = encodeURIComponent(calUrl);
const dinner = encodeURIComponent(dinnerUrl);
const birthday = encodeURIComponent(birthdayUrl);

const calP = `${proxy}/?url=${cal}`;
const dinP = `${proxy}/?url=${dinner}`;
const bdP = `${proxy}/?url=${birthday}`;

interface Props {}

interface State {
  kalenderData: any;
  birthdays: any;
  dinners: any;
}

class Kalender extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      kalenderData: { ...primeDays(0) },
      dinners: {},
      birthdays: {},
    };
  }

  componentDidMount() {
    this.updateData();
    setInterval(() => this.updateData(), 1000 * 60);
  }

  getDays() {
    const out: any = [];
    const dayKeys = getDayKeys(30);
    dayKeys.forEach(d => {
      const cald = this.state.kalenderData[d];
      const birthdays = this.state.birthdays[d];
      const dinners = this.state.dinners[d];

      if (cald || birthdays || dinners) {
        out.push(<Dag key={d} date={d} events={cald} dinner={dinners} birthdays={birthdays} />);
      }
    });
    return out;
  }

  async updateData() {
    try {
      const kalenderData = await getIcal(calP, true);
      const dinners = await getIcal(dinP, false);
      const birthdays = await getIcal(bdP, false);
      this.setState({ kalenderData, dinners, birthdays });
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return <div style={{ flex: 1 }}>{this.getDays()}</div>;
  }
}

function parseIcalEvent(e: any, useItem = false) {
  try {
    const now = Moment();
    const start = Moment(e.startDate.toJSDate());
    const end = Moment(e.endDate.toJSDate());
    const name = useItem ? e.item.summary : e.summary;

    const fullDay = e.startDate.hour === 0 && e.endDate.hour === 0 && e.endDate.day !== e.startDate.day;

    let oneDay = true;
    if (fullDay) {
      if (
        Moment(end)
          .subtract(1, 'day')
          .startOf('day')
          .isAfter(Moment(start).startOf('day'))
      )
        oneDay = false;
    }

    if (!fullDay) {
      oneDay = start.isSame(end, 'day');
    }

    let groupString = start.format('YYYY-MM-DD');
    const startsBeforeToday = start.isBefore(now, 'day');
    if (startsBeforeToday) {
      groupString = now.format('YYYY-MM-DD');
    }
    const id = e.uid ? e.uid : e.item.uid;
    return {
      id,
      name,
      start,
      end,
      fullDay,
      oneDay,
      groupString,
    };
  } catch (err) {
    console.log(err);
    throw new Error('Could not parse iCal event');
  }
}

function primeDays(number = 7) {
  // Prime array for events.
  const out = {};
  for (let i = 0; i < number; i += 1) {
    const m = Moment();
    m.add(i, 'day');
    const s = m.format('YYYY-MM-DD');
    out[s] = initDay(s);
  }
  return out;
}

function initDay(sortString: string) {
  return { events: [], sortString, sortStamp: parseInt(Moment(sortString, 'YYYY-MM-DD').format('x'), 10) };
}

function getDayKeys(max = 100) {
  const start = Moment().startOf('day');
  const out = [];
  for (let i = 0; i < max; i += 1) {
    out.push(start.format('YYYY-MM-DD'));
    start.add(1, 'days');
  }
  return out;
}

const mapStateToProps = (state: AppStore) => {
  return {};
};

export default connect(mapStateToProps)(Kalender);

async function getIcal(url: string, prime = false) {
  let parsedEvents = {};
  try {
    const now = Moment();
    const data = await Axios.get(url);

    if (data.status !== 200) throw Error('Couldnt fetch calendar data');

    const icalExpander = new IcalExpander({ ics: data.data, maxIterations: 1000 });
    const events = icalExpander.between(now.toDate(), now.add(60, 'days').toDate());

    const sorted: any = {};

    sorted.events = events.events.sort((a: any, b: any) => {
      const start = a.startDate.toJSDate();
      const end = b.startDate.toJSDate();
      return start - end;
    });

    sorted.occurrences = events.occurrences.sort((a: any, b: any) => {
      const start = a.item.startDate.toJSDate();
      const end = b.item.startDate.toJSDate();
      return start - end;
    });

    // Prime array for events.
    if (prime) {
      parsedEvents = { ...primeDays(0) };
    }

    sorted.occurrences.forEach((e: any) => {
      try {
        const event = parseIcalEvent(e, true);
        if (!parsedEvents[event.groupString]) {
          parsedEvents[event.groupString] = initDay(event.groupString);
        }
        parsedEvents[event.groupString].events.push(event);
      } catch (err) {
        console.log(err);
      }
    });

    sorted.events.forEach((e: any) => {
      try {
        const event = parseIcalEvent(e, false);
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
