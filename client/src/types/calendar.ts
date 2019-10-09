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
  events: [Event];
  sortStamp: number;
  sortString: string;
}
