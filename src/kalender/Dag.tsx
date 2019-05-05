import React from 'react';
import Moment from 'moment';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';

interface Props {
  dinner: any;
  birthdays: any;
  events: any;
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

  private getBirthdays() {
    if (!this.props.birthdays || !this.props.birthdays.events) return null;
    const out: any[] = [];
    try {
      this.props.birthdays.events.forEach((b: any) => {
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

  private getEvents() {
    if (!this.props.events || !this.props.events.events) return null;
    const out: any[] = [];

    try {
      const events = this.props.events.events.sort((a: any, b: any) => {
        return a.start.isBefore(b.start) ? -1 : 1;
      });

      events.forEach((e: any) => {
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
