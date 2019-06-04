import React from 'react';
import Moment from 'moment';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';
import GraphLong from '../weather/GraphLong';
import { Event, EventDataSet } from '../types/calendar';
import './kalender.css';
import { WeatherForAPlace } from '../types/weather';

interface Props {
  dinner: EventDataSet;
  birthdays: EventDataSet;
  events: EventDataSet;
  date: string;
  weatherAsGraph: boolean;
  weather?: WeatherForAPlace;
}

function getDayHeader(date: Moment.Moment) {
  return date.format('dddd D. MMM');
}

class Dag extends React.PureComponent<Props, {}> {
  static defaultProps = {
    weatherAsGraph: false,
  };

  private getDinner() {
    try {
      if (!this.props.dinner || !this.props.dinner.events) return null;
      return (
        <div className="kalenderSubInfo">
          <img
            src="dinner.png"
            width={15}
            height={15}
            alt="Dinner"
            style={{ filter: 'invert(100%)', marginRight: 5 }}
          />
          {this.props.dinner.events[0].name}
        </div>
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    }
  }

  private getBirthdays(): JSX.Element[] {
    if (!this.props.birthdays || !this.props.birthdays.events) return [];
    const out: JSX.Element[] = [];
    try {
      this.props.birthdays.events.forEach((b: Event) => {
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
          <div className="kalenderSubInfo" key={b.id}>
            <img
              src="kake.png"
              width={15}
              height={15}
              alt="Kake"
              style={{ filter: 'invert(100%)', marginRight: 5 }}
            />
            {name}
          </div>,
        );
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    return out;
  }

  private getEvents(): JSX.Element[] {
    if (!this.props.events || !this.props.events.events) return [];
    const out: JSX.Element[] = [];

    try {
      const events = this.props.events.events.sort((a: Event, b: Event) => {
        return a.start.isBefore(b.start) ? -1 : 1;
      });

      events.forEach((e: Event) => {
        if (e.fullDay) {
          out.push(<HendelseFullDag key={e.id} data={e} />);
        } else {
          out.push(<HendelseMedTid key={e.id} data={e} />);
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    return out;
  }

  private getWeather(date: Moment.Moment) {
    if (!this.props.weather) return null;
    const now = Moment();
    const from = Moment(date).startOf('day');
    const to = Moment(date)
      .add(1, 'day')
      .startOf('day');
    const daysDiff = from.diff(now, 'days');
    const weatherFiltered = Object.values(this.props.weather.long).filter(w => {
      return Moment(w.time).isBetween(from, to, undefined, '[]');
    });
    const weatherUnique = uniqBy(weatherFiltered, 'time');
    const weatherSorted = sortBy(weatherUnique, 'time');
    if (daysDiff > 5) return null;
    return (
      <GraphLong
        weatherLong={this.props.weather.long}
        weather={weatherSorted}
        limits={this.props.weather.limits}
        from={from}
        to={to}
      />
    );
  }

  public render() {
    const now = Moment();
    const day = Moment(this.props.date);
    const today = now.isSame(day, 'day');
    const dayDiff = now.diff(day, 'days');
    return (
      <div className="kalenderDag">
        <div
          className="kalenderDato"
          style={{ padding: 15, paddingLeft: 20, gridColumn: '1 / 2', gridRow: '1 / 2' }}
        >
          {getDayHeader(day)}
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '2 / 4' }}>{this.getWeather(day)}</div>
        <div style={{ padding: 15, paddingLeft: 20, gridColumn: '1 / 2', gridRow: '2 / 4' }}>
          {this.getBirthdays()}
          {this.getDinner()}
          {this.getEvents()}
        </div>
      </div>
    );
  }
}

export default Dag;
