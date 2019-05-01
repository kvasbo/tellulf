import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';

class Dag extends React.PureComponent {
  getDinner() {
    try {
      if (!this.props.dinner || !this.props.dinner.events) return null;
      return (
        <div style={{ paddingLeft: 15 }}>{this.props.dinner.events[0].name}</div>
      );
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  getBirthdays() {
    if (!this.props.birthdays || !this.props.birthdays.events) return null;
    const out = [];
    try {
      this.props.birthdays.events.forEach((b) => {
        const matches = b.name.match(/\d+$/);
        // eslint-disable-next-line prefer-destructuring
        let name = b.name;
        if (matches) {
          const number = parseInt(matches[0], 10);
          const age = new Date().getFullYear() - number;
          name = name.substring(0, name.length - 5);
          name = `${name} (${age})`;
        }
        out.push(<div style={{ padding: 10 }} key={b.id}>{name}</div>);
      });
    } catch (err) {
      console.log(err);
    }
    return out;
  }

  getEvents() {
    if (!this.props.events || !this.props.events.events) return null;
    const out = [];

    try {
      const events = this.props.events.events.sort((a, b) => {
        return (a.start.isBefore(b.start)) ? -1 : 1;
      });

      events.forEach((e) => {
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


  render() {
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

Dag.defaultProps = {
  dinner: undefined,
  birthdays: undefined,
  events: undefined,
};

Dag.propTypes = {
  dinner: PropTypes.object,
  birthdays: PropTypes.object,
  events: PropTypes.object,
  date: PropTypes.any.isRequired,
};

export default Dag;


function getDayHeader(date) {
  const dateHeaderFormats = {
    sameDay: '[I dag]',
    nextDay: '[I morgen]',
    nextWeek: 'dddd',
    nextMonth: 'dddd D.',
    sameElse: 'dddd DD. MMM',
  };
  const dateStr = Moment(date).calendar(null, dateHeaderFormats);
  return dateStr;
}
