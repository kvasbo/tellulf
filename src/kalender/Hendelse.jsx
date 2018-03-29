import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import './style.css';

export class HendelseMedTid extends Component {
  render() {
    return (
      <div className="hendelse">
        <span className="event">{this.props.data.name}</span>
        <span className="eventTime">{getTimeString(this.props.data)}</span>
      </div>
    );
  }
}

export class HendelseFullDag extends Component {
  render() {
    if (this.props.data.oneDay) {
      return (
        <div className="hendelse">
          <span className="event">{this.props.data.name}</span>
        </div>
      );
    }

    return (
      <div className="hendelse">
        <span className="event">{this.props.data.name}</span>
        <span className="eventTime">{getTimeString(this.props.data)}</span>
      </div>
    );
  }
}

function getTimeString(event) {
  let timeString = '';

  if (event.fullday) // Full day events
  {
    if (!event.oneDay) {
      timeString = Moment(event.start).calendar(null, fullDayFormats());

      // subtract one, as we only want the last included day
      const newEnd = Moment(event.end);
      newEnd.subtract(1, 'day');

      timeString += ` - ${Moment(newEnd).calendar(null, fullDayFormats())}`;
    }
  } else {
    var toFormats = normalDayToFormats();

    if (!event.oneDay) {
      var toFormats = normalFormats();
    }

    timeString = `${Moment(event.start).calendar(null, normalDayToFormats())}→${Moment(event.end).calendar(null, toFormats)}`;
  }
  return timeString;
}

function fullDayFormats() {
  return {
    lastWeek: '[forrige] dddd',
    nextWeek: 'dddd',
    sameDay: '[I dag]',
    nextDay: '[I morgen]',
    sameElse: 'DD.MM',
  };
}

function normalFormats() {
  return {
    sameDay: 'HH:mm',
    nextDay: '[I morgen] HH:mm',
    nextWeek: 'dddd HH:mm',
    sameElse: 'ddd DD. HH:mm',
  };
}

function normalDayToFormats() {
  return {
    sameDay: 'HH:mm',
    nextDay: 'HH:mm',
    nextWeek: 'HH:mm',
    sameElse: 'HH:mm',
  };
}

HendelseMedTid.propTypes = {
  data: PropTypes.object.isRequired,
};

HendelseFullDag.propTypes = {
  data: PropTypes.object.isRequired,
};
