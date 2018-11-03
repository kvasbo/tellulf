import React from 'react';
import Moment from 'moment';

class HendelseMedTid extends React.PureComponent {

  render() {
    return (
      <div style={{ backgroundColor: '#222222', margin: 5, padding: 5, paddingLeft: 15, borderRadius: 5 }}>
        <div style={{ color: '#FFFFFF' }} >{this.props.data.name}</div>
        <div style={{ color: '#FFFFFF' }} >{getTimeString(this.props.data)}</div>
      </div>
    );
  }
}

export function getTimeString(event) {
  let timeString = '';
  if (event.fullDay){ // Full day events
    if (!event.oneDay) {
      timeString = Moment(event.start).calendar(null, fullDayFormats());
      // subtract one, as we only want the last included day
      const newEnd = Moment(event.end);
      newEnd.subtract(1, 'day');
      timeString += ` → ${Moment(newEnd).calendar(null, fullDayFormats())}`;
    }
  } else {
    let toFormats = normalDayToFormats();
    if (!event.oneDay) {
      toFormats = normalFormats();
    }
    timeString = `${Moment(event.start).calendar(null, normalDayToFormats())} → ${Moment(event.end).calendar(null, toFormats)}`;
  }
  return timeString;
}

function fullDayFormats() {
  return {
    lastWeek: 'dddd DD.',
    nextWeek: 'dddd',
    sameDay: '[I dag]',
    nextDay: '[I morgen]',
    sameElse: 'DD. MMM',
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

export default HendelseMedTid;
