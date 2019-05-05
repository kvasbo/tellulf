import React from 'react';
import Moment from 'moment';

const style = {
  backgroundColor: '#222222',
  margin: 5,
  padding: 5,
  paddingLeft: 10,
  borderRadius: '0.5vw',
};

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

export function getTimeString(event: any) {
  let timeString = '';
  if (event.fullDay) {
    // Full day events
    if (!event.oneDay) {
      timeString = Moment(event.start).calendar(undefined, fullDayFormats());
      // subtract one, as we only want the last included day
      const newEnd = Moment(event.end);
      newEnd.subtract(1, 'day');
      timeString += ` → ${Moment(newEnd).calendar(undefined, fullDayFormats())}`;
    }
  } else {
    let toFormats = normalDayToFormats();
    if (!event.oneDay) {
      toFormats = normalFormats();
    }
    timeString = `${Moment(event.start).calendar(undefined, normalDayToFormats())} → ${Moment(event.end).calendar(
      undefined,
      toFormats,
    )}`;
  }
  return timeString;
}

interface Props {
  data: {
    name: string;
    oneDay: boolean;
  };
}

class HendelseMedTid extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div style={style}>
        <div>{this.props.data.name}</div>
        <div>{getTimeString(this.props.data)}</div>
      </div>
    );
  }
}

export default HendelseMedTid;
