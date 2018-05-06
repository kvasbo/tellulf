import React, { Component } from 'react';
import Moment from 'moment';
import Dag from './Dag';
import firebase from '../firebase';
import './style.css';

export default class Kalender extends Component {
  constructor(props) {
    super(props);

    this.state = {
      kalenderData: [],
      dinners: [],
    };
  }

  componentDidMount() {
    const firestore = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    firestore.settings(settings);
    const fireRef = firestore.collection('kalender')
    fireRef.onSnapshot((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.id === 'felles') {
          this.parseCalendar(doc.data().data);
        }

        if (doc.id === 'mat') {
          this.parseDinners(doc.data().data);
        }
      });
    });
  }

  getDays() {
    const out = [];
    for (const day in this.state.kalenderData) {
      out.push(<Dag key={day} date={day} events={this.state.kalenderData[day]} dinner={this.state.dinners[day]} weather={this.state.kalenderData[day].weather} />);
    }
    return out;
  }

  parseDinners(data) {
    const bEvents = {};

    // Build array of events keyed by date.
    for (let i = 0; i < data.length; i += 1) {
      const e = parseEvent(data[i]);

      if (typeof (bEvents[e.groupString]) !== 'object') {
        bEvents[e.groupString] = {};
        bEvents[e.groupString].events = [];
      }

      bEvents[e.groupString].events.push(e);
    }

    this.setState({ dinners: bEvents });
  }

  parseCalendar(data) {
    const bEvents = {};

    // Prime array for events.

    for (let i = 0; i < 7; i += 1) {
      const m = new Moment();
      m.add(i, 'day');
      const s = m.format('YYYY-MM-DD');
      bEvents[s] = {};
      bEvents[s].events = [];
    }

    // Build array of events keyed by date.
    for (let i = 0; i < data.length; i += 1) {
      const e = parseEvent(data[i]);

      if (typeof (bEvents[e.groupString]) !== 'object') {
        bEvents[e.groupString] = {};
        bEvents[e.groupString].events = [];
      }

      bEvents[e.groupString].events.push(e);
    }

    this.setState({ kalenderData: bEvents });
  }


  render() {
    return (
      <div className="kalenderRamme">
        {this.getDays()}
      </div>
    );
  }
}

function parseEvent(data) {
  const event = {};
  const today = Moment();
  const start = Moment(data.start);
  const end = Moment(data.end);
  let oneDay = true;
  // Not full day, and it is not a full day event.
  if (!data.fullDay) {
    if (!start.isSameOrBefore(end.endOf('day'), 'day')) oneDay = false;
  }

  if (data.fullDay) {
    if (end.subtract(1, 'day').startOf('day').isAfter(start.startOf('day'))) oneDay = false;
  }
  const startsBeforeToday = start.isBefore(today, 'day');
  let groupString = start.format('YYYY-MM-DD');
  // If it starts before today, include in today group
  if (startsBeforeToday) {
    groupString = today.format('YYYY-MM-DD');
  }

  event.name = data.name;
  event.groupString = groupString;
  event.start = Moment(data.start);
  event.fullday = data.fullDay;
  event.oneDay = oneDay;
  event.end = Moment(data.end);

  return event;
}
