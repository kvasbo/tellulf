import Moment from 'moment';
import React from 'react';
import { IcalParseResult } from '../types/calendar';
import Dag from './Dag';
import { getIcal } from './kalenderHelpers';

const proxy = 'https://us-central1-tellulf-151318.cloudfunctions.net/proxy';

const calUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_ognucfh1asvpgc50mqms5tu0kk%40group.calendar.google.com/private-7020f002efde8095cc911279983fb92a/basic.ics';

const birthdayUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_upelraeuo31neuoq31f9decudg%40group.calendar.google.com/private-6718a3a9f7b74d60372a3f2be75804d6/basic.ics';

const cal = encodeURIComponent(calUrl);
const birthday = encodeURIComponent(birthdayUrl);

const calP = `${proxy}/?url=${cal}`;
const bdP = `${proxy}/?url=${birthday}`;

interface State {
  kalenderData: IcalParseResult;
  birthdays: IcalParseResult;
}

class Kalender extends React.PureComponent<unknown, State> {
  private interval = 0;
  public constructor(props = {}) {
    super(props);
    this.state = {
      kalenderData: {},
      birthdays: {},
    };
  }

  public componentDidMount(): void {
    this.updateData();
    this.interval = window.setInterval(() => this.updateData(), 1000 * 60 * 15);
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.interval);
  }

  private getDays() {
    const out: JSX.Element[] = [];
    const start = Moment().startOf('day');
    const now = start.clone();
    const days: Moment.Moment[] = [];

    // Prime the data set
    for (let i = 0; i < 30; i += 1) {
      days.push(start.clone());
      start.add(1, 'days');
    }

    days.forEach((day) => {
      const d = day.format('YYYY-MM-DD');
      const diff = day.diff(now, 'days');
      const cald = this.state.kalenderData[d];
      const birthdays = this.state.birthdays[d];

      if (diff < 14 || cald || birthdays) {
        out.push(
          <Dag key={`kalenderdag${d}`} date={day.toDate()} events={cald} birthdays={birthdays} />,
        );
      }
    });
    return out;
  }

  private async updateData() {
    try {
      const kalenderData = await getIcal(calP);
      const birthdays = await getIcal(bdP);

      this.setState({ kalenderData, birthdays });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  public render(): React.ReactNode {
    return <div style={{ flex: 1, overflow: 'auto' }}>{this.getDays()}</div>;
  }
}

export default Kalender;
