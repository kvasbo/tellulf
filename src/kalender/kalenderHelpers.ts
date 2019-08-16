import Moment from 'moment';
import Axios from 'axios';
import IcalExpander from 'ical-expander';
import { Event } from '../types/calendar';

interface APIEvent {
  startDate: {
    toJSDate: Function;
    hour: number;
    day: number;
  };
  endDate: {
    toJSDate: Function;
    hour: number;
    day: number;
  };
  item?: {
    summary: string;
    uid: string;
    startDate: {
      toJSDate: Function;
      hour: number;
      day: number;
    };
    endDate: {
      toJSDate: Function;
      hour: number;
      day: number;
    };
  };
  summary?: string;
  uid?: string;
}

export function initDay(
  sortString: string,
): { events: Event[]; sortString: string; sortStamp: number } {
  return {
    events: [],
    sortString,
    sortStamp: Number(Moment(sortString, 'YYYY-MM-DD').format('x')),
  };
}

export function parseIcalEvent(e: APIEvent): Event {
  try {
    const now = Moment();
    const start = Moment(e.startDate.toJSDate());
    const end = Moment(e.endDate.toJSDate());

    let name = 'shiiiiit';
    if (e.item && e.item.summary) {
      name = e.item.summary;
    } else if (e.summary) {
      name = e.summary;
    }

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

    let id = 'shiiiit';
    if (e.uid) {
      id = e.uid;
    } else if (e.item && e.item.uid) {
      id = e.item.uid;
    }

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
    // eslint-disable-next-line no-console
    console.log(err);
    throw new Error('Could not parse iCal event');
  }
}

interface SortEvent {
  item: { startDate: { toJSDate: Function } };
}
interface SortOccurrence {
  startDate: { toJSDate: Function };
}

export async function getIcal(url: string) {
  const parsedEvents = {};
  try {
    const now = Moment();
    const data = await Axios.get(url);

    if (data.status !== 200) throw Error('Couldnt fetch calendar data');

    const icalExpander = new IcalExpander({ ics: data.data, maxIterations: 1000 });
    const events = icalExpander.between(now.toDate(), now.add(60, 'days').toDate());

    const sorted: {
      events: APIEvent[];
      occurrences: APIEvent[];
    } = { events: [], occurrences: [] };

    sorted.events = events.events.sort((a: SortOccurrence, b: SortOccurrence) => {
      const start = a.startDate.toJSDate();
      const end = b.startDate.toJSDate();
      return start - end;
    });

    sorted.occurrences = events.occurrences.sort((a: SortEvent, b: SortEvent) => {
      const start = a.item.startDate.toJSDate();
      const end = b.item.startDate.toJSDate();
      return start - end;
    });

    sorted.occurrences.forEach((e: APIEvent) => {
      try {
        const event = parseIcalEvent(e);
        if (!parsedEvents[event.groupString]) {
          parsedEvents[event.groupString] = initDay(event.groupString);
        }
        parsedEvents[event.groupString].events.push(event);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });

    sorted.events.forEach((e: APIEvent) => {
      try {
        const event = parseIcalEvent(e);
        if (!parsedEvents[event.groupString]) {
          parsedEvents[event.groupString] = initDay(event.groupString);
        }
        parsedEvents[event.groupString].events.push(event);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }

  return parsedEvents;
}
