import React from 'react';
import Moment from 'moment';
import { DateTime } from 'luxon';
import { Event } from '../types/calendar';
import { GenericProps } from '../types/generic';

Moment.locale('nb');

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

export function getTimeString(event: Event): string {
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
    timeString = `${Moment(event.start).calendar(undefined, normalDayToFormats())} → ${Moment(
      event.end,
    ).calendar(undefined, toFormats)}`;
  }
  return timeString;
}

interface Props {
  data: Event;
}

class HendelseMedTid extends React.PureComponent<Props, GenericProps> {
  public render(): React.ReactNode {
    return (
      <div className="kalenderSubInfo">
        <div>{this.props.data.name}</div>
        <div>{getTimeString(this.props.data)}</div>
      </div>
    );
  }
}

export default HendelseMedTid;
