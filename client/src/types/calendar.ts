import Moment from 'moment';

export interface Event {
  name: string;
  id: string;
  start: Moment.Moment;
  end: Moment.Moment;
  fullDay: boolean;
  oneDay: boolean;
  groupString: string;
}

export interface EventDataSet {
  events: Event[];
  sortStamp: number;
  sortString: string;
}

export interface IcalParseResult {
  [s: string]: CalendarDay;
}

export interface CalendarDay {
  events: Event[];
  sortString: string;
  sortStamp: number;
}
