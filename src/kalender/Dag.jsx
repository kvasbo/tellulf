import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { HendelseMedTid, HendelseFullDag } from './Hendelse';

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
        {this.getDinner()}
        <span className="events">{this.getEvents(this.props.events)}</span>

      </div>
    );
  }
}

class DayHeaderWeather extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      symbol: null,
      temperature: null,
    };
  }

  componentDidMount() {
    this.getWeather();
  }

  getWeather() {
    const wTimeTmp = Moment(this.props.dato);
    wTimeTmp.set({ hour: 14, minute: 0 });
  }

  getWeatherSymbol(symbolId) {
    if (symbolId === null) return 'blank.png';

    if (parseInt(symbolId) < 10) {
      return `0${symbolId}.svg`;
    }

    return `${symbolId}.svg`;
  }

  getTemperature(temp) {
    if (temp === null) return '';

    return `${temp}°`;
  }

  render() {
    return (
      <span className="headerWeather">
        <span className="headerWeatherTemp">{this.getTemperature(this.state.temperature)}</span>
        <img src={`/yr/symboler/${this.getWeatherSymbol(this.state.symbol)}`} className="weatherImage" />
      </span>
    );
  }
}

Dag.propTypes = {
  date: PropTypes.object.isRequired,
  dato: PropTypes.object.isRequired,
};
