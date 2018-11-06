import React from 'react';
import Moment from 'moment';
import DagHeaderWeather from './DagHeaderWeather';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';

class Dag extends React.PureComponent {
  getDinner() {
    if (!this.props.dinner) return null;
    return (
      <div>{this.props.dinner.events[0].name}</div>
    );
  }

  getEvents() {
    if (!this.props.events) return null;
    const events = this.props.events.events.sort((a,b) => {
      return (a.start.isBefore(b.start)) ? -1 : 1;
    });
    const out = [];
    events.forEach((e) => {
      if (e.fullDay) {
        out.push(<HendelseFullDag key={e.id} data={e} />);
      } else {
        out.push(<HendelseMedTid key={e.id} data={e} />);
      }
    });
    return out;
  }

  getDayHeader(date) {
    const dateHeaderFormats = {
      sameDay: '[I dag]',
      nextDay: '[I morgen]',
      nextWeek: 'dddd D.',
      sameElse: 'dddd DD. MMM',
    };
    const dateStr = Moment(date).calendar(null, dateHeaderFormats);
    return dateStr;
  }

  render() {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ padding: 5 }}>{this.getDayHeader(this.props.date)}</div>
        <DagHeaderWeather weather={this.props.weather} date={this.props.date} />
        {this.getDinner()}
        {this.getEvents()}
      </div>
    );
  }
}

export default Dag;
