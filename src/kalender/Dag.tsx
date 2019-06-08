import React from 'react';
import Moment from 'moment';
import store from 'store';
import uniqBy from 'lodash/uniqBy';
import sortBy from 'lodash/sortBy';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';
import GraphLong from '../weather/GraphLong';
import { Event, EventDataSet } from '../types/calendar';
import './kalender.css';
import { WeatherData, WeatherStore, WeatherDataSet } from '../types/weather';

interface Props {
  dinner: EventDataSet;
  birthdays: EventDataSet;
  events: EventDataSet;
  date: string;
  weatherAsGraph: boolean;
  weather?: WeatherStore;
  useShortWeather: boolean;
}

interface State {
  sted: string;
}

function getDayHeader(date: Moment.Moment) {
  return date.format('dddd D. MMM');
}

class Dag extends React.PureComponent<Props, State> {
  static defaultProps = {
    weatherAsGraph: false,
    useShortWeather: false,
    sted: 'oslo',
  };

  public constructor(props: Props) {
    super(props);
    this.state = { sted: this.loadSted() };
  }

  private loadSted(): string {
    const sted = store.get(`sted_${this.props.date}`, 'oslo');
    return sted;
  }

  private togglePlace(): void {
    const sted = this.loadSted();
    const nyttSted = sted === 'oslo' ? 'sandefjord' : 'oslo';
    store.set(`sted_${this.props.date}`, nyttSted);
    this.setState({ sted: nyttSted });
  }

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

  private getWeather(date: Moment.Moment, sted: string) {
    if (!this.props.weather || !this.props.weather[sted]) return null;
    const now = Moment();
    const from = Moment(date).startOf('day');
    const to = Moment(date)
      .add(1, 'day')
      .startOf('day');
    const filterFrom = Moment(from).subtract(12, 'hours');
    const filterTo = Moment(to).add(12, 'hours');
    const daysDiff = from.diff(now, 'days');

    const weather: WeatherDataSet = this.props.useShortWeather
      ? this.props.weather[sted].short
      : this.props.weather[sted].long;
    const weatherFiltered = Object.values(weather).filter(w => {
      return Moment(w.time).isBetween(filterFrom, filterTo, undefined, '[]');
    });
    const weatherUnique = uniqBy(weatherFiltered, 'time');
    const weatherSorted: WeatherData[] = sortBy(weatherUnique, 'time');
    if (daysDiff > 5) return null;
    return (
      <GraphLong
        weather={weatherSorted}
        from={from}
        to={to}
        sted={sted}
        showPlace={sted !== 'oslo'}
        onClick={() => this.togglePlace()}
      />
    );
  }

  public render() {
    const day = Moment(this.props.date);
    const stedToShow = this.state.sted !== 'oslo' ? this.state.sted.toLocaleUpperCase() : null;
    return (
      <div className="kalenderDag">
        <div
          className="kalenderDato"
          style={{ padding: 15, paddingLeft: 20, gridColumn: '1 / 2', gridRow: '1 / 2' }}
        >
          {getDayHeader(day)}
        </div>
        <div style={{ gridColumn: '1 / 3', gridRow: '2 / 4' }}>
          {this.getWeather(day, this.state.sted)}
        </div>
        <div
          style={{
            gridColumn: '1 / 3',
            gridRow: '2 / 4',
            display: 'flex',
            padding: 10,
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            color: '#ffffffaa',
          }}
        >
          {stedToShow}
        </div>
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
