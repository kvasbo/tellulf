import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { HendelseMedTid, HendelseFullDag } from './Hendelse';
import symbols from '../weather/symbols';
import DayHeaderWeather from './DagHeaderWeather';

import './style.css';

export default class Dag extends Component {
  getEvents(data) {
    if (typeof (data.events) === 'undefined') return null;

    const out = [];
    for (let i = 0; i < data.events.length; i += 1) {
      if (data.events[i].fullday) {
        out.push(<HendelseFullDag key={i} data={data.events[i]} />);
      } else {
        out.push(<HendelseMedTid key={i} data={data.events[i]} />);
      }
    }
    return out;
  }

  getWeather() {
    return (
      <DayHeaderWeather key={`dayWeather${this.props.date}`} dato={this.props.date} />
    );
  }

  getDinner() {
    if (typeof this.props.dinner === 'undefined') return null;
    return (
      <span className="dinner">{this.props.dinner.events[0].name}</span>
    );
  }

  getDayHeader(date) {
    const dateHeaderFormats = {
      sameDay: '[I dag]',
      nextDay: '[I morgen]',
      nextWeek: 'dddd',
      sameElse: 'dddd DD.',
    };
    const dateStr = Moment(date).calendar(null, dateHeaderFormats);
    return dateStr;
  }

  render() {
    return (
      <div className="calendarDay">
        <span className="calendarDayHeader">
          <span>{this.getDayHeader(this.props.date)}</span>
        </span>
        <DayHeaderWeather weather={this.props.weather} date={this.props.date} />
        {this.getDinner()}
        <span className="events">{this.getEvents(this.props.events)}</span>
      </div>
    );
  }
}
Dag.propTypes = {
  date: PropTypes.string.isRequired,
};
