import React from 'react';
import Moment from 'moment';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';
import { Event, EventDataSet } from '../types/calendar';
interface Props {
  dinner: EventDataSet;
  birthdays: EventDataSet;
  events: EventDataSet;
  date: string;
}

function getDayHeader(date: string) {
  const dateHeaderFormats = {
    sameDay: '[I dag]',
    nextDay: '[I morgen]',
    nextWeek: 'dddd',
    nextMonth: 'dddd D.',
    sameElse: 'dddd DD. MMM',
  };
  const dateStr = Moment(date).calendar(undefined, dateHeaderFormats);
  return dateStr;
}

class Dag extends React.PureComponent<Props, {}> {
  private getDinner() {
    try {
      if (!this.props.dinner || !this.props.dinner.events) return null;
      return <div style={{ paddingLeft: 15 }}>{this.props.dinner.events[0].name}</div>;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private getBirthdays(): JSX.Element[] {
    if (!this.props.birthdays || !this.props.birthdays.events) return [];
    const out: JSX.Element[] = [];
    try {
      this.props.birthdays.events.forEach((b: Event) => {
        const matches = b.name.match(/\d+$/);
        // eslint-disable-next-line prefer-destructuring
        let name = b.name;
        if (matches) {
          const number = parseInt(matches[0], 10);
          const age = new Date().getFullYear() - number;
          name = name.substring(0, name.length - 5);
          name = `${name} (${age})`;
        }
        out.push(
          <div style={{ padding: 10 }} key={b.id}>
            {name}
          </div>,
        );
      });
    } catch (err) {
      console.log(err);
    }
    return out;
  }

  private getEvents(): JSX.Element[] {
    if (!this.props.events || !this.props.events.events) return [];
    const out: JSX.Element[] = [];

    try {
      const events = this.props.events.events.sort((a: Event, b: Event) => {
        return a.start.isBefore(b.start) ? -1 : 1;
      });

      events.forEach((e: Event) => {
        if (e.fullDay) {
          out.push(<HendelseFullDag key={e.id} data={e} />);
        } else {
          out.push(<HendelseMedTid key={e.id} data={e} />);
        }
      });
    } catch (err) {
      console.log(err);
    }
    return out;
  }

  public render() {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ padding: 5 }}>{getDayHeader(this.props.date)}</div>
        {this.getDinner()}
        {this.getBirthdays()}
        {this.getEvents()}
      </div>
    );
  }
}

export default Dag;
