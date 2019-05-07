import Moment from 'moment';
import Axios from 'axios';
import IcalExpander from 'ical-expander';
import { Event } from '../types/calendar';

interface APIEvent {
  startDate: Moment.Moment;
  endDate: Moment.Moment;
  item: {
    summary: string | undefined;
  };
  summary: string | undefined;
}

export function initDay(sortString: string) {
  return {
    events: [],
    sortString,
    sortStamp: parseInt(Moment(sortString, 'YYYY-MM-DD').format('x'), 10),
  };
}

export function primeDays(number = 7) {
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

export function parseIcalEvent(e: any, useItem = false): Event {
  try {
    const now = Moment();
    const start = Moment(e.startDate.toJSDate());
    const end = Moment(e.endDate.toJSDate());
    const name = useItem ? e.item.summary : e.summary;

    const fullDay =
      e.startDate.hour === 0 && e.endDate.hour === 0 && e.endDate.day !== e.startDate.day;

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

export async function getIcal(url: string, prime = false) {
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

export function getDayKeys(max = 100) {
  const start = Moment().startOf('day');
  const out = [];
  for (let i = 0; i < max; i += 1) {
    out.push(start.format('YYYY-MM-DD'));
    start.add(1, 'days');
  }
  return out;
}
