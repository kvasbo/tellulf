import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import store from 'store';
import maxBy from 'lodash/maxBy';
import { AppStore } from '../redux/reducers';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';
import WeatherGraph from '../weather/WeatherGraph';
import { createForecastSummary, filterForecastData } from '../weather/weatherHelpers';
import { Event, EventDataSet } from '../types/calendar';
import './kalender.css';
import { ForecastStore, WeatherDataSeries, HourForecast } from '../types/forecast';

interface Props {
  dinner: EventDataSet;
  birthdays: EventDataSet;
  events: EventDataSet;
  date: Moment.Moment;
  forecast: ForecastStore;
}

interface State {
  sted: string;
}

function getDayHeader(date: Moment.Moment) {
  return date.format('dddd D.');
}

class Dag extends React.PureComponent<Props, State> {
  private togglePlace: () => void;

  public constructor(props: Props) {
    super(props);
    this.state = { sted: this.loadSted() };
    this.togglePlace = (): void => {
      const sted = this.loadSted();
      const nyttSted = sted === 'oslo' ? 'sandefjord' : 'oslo';
      store.set(`sted_${this.props.date}`, nyttSted);
      this.setState({ sted: nyttSted });
    };
  }

  private loadSted(): string {
    const sted = store.get(`sted_${this.props.date}`, 'oslo');
    return sted;
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

  private filterForecast(): WeatherDataSeries {
    if (!this.props.forecast.data || !this.props.forecast.data[this.state.sted]) {
      return {};
    }

    return filterForecastData(
      this.props.date,
      this.props.forecast.data[this.state.sted].forecast,
      6,
      6,
    );
  }

  private getForecastSummary(): string {
    return createForecastSummary(this.filterForecast());
  }

  private getWeather(date: Moment.Moment, sted: string) {
    const forecast = this.filterForecast();

    if (!showWeatherGraphForDay(this.props.date, forecast)) return null;

    const from = Moment(date).startOf('day');
    const to = Moment(date).add(1, 'day');

    return (
      <WeatherGraph
        weather={forecast}
        from={from}
        to={to}
        sted={sted}
        showPlace={sted !== 'oslo'}
        onClick={this.togglePlace}
        limits={this.props.forecast.limits}
      />
    );
  }

  public render(): React.ReactNode {
    const stedToShow = this.state.sted !== 'oslo' ? this.state.sted.toLocaleUpperCase() : null;
    return (
      <div className="kalenderDag">
        <div
          className="kalenderDato"
          style={{ padding: 15, paddingLeft: 20, gridColumn: '1 / 2', gridRow: '1 / 2' }}
        >
          {getDayHeader(this.props.date)}
        </div>
        <div
          className="kalenderDato weatherSummary"
          style={{ padding: 15, paddingLeft: 20, gridColumn: '2 / 3', gridRow: '1 / 2' }}
        >
          {this.getForecastSummary()}
        </div>
        <div
          style={{ gridColumn: '1 / 3', gridRow: '2 / 4', display: 'flex', alignItems: 'flex-end' }}
        >
          {this.getWeather(this.props.date, this.state.sted)}
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
        <div
          style={{
            padding: 15,
            paddingLeft: 20,
            gridColumn: '1 / 2',
            gridRow: '2 / 4',
          }}
        >
          {this.getBirthdays()}
          {this.getDinner()}
          {this.getEvents()}
        </div>
      </div>
    );
  }
}

// CHeck if we have a full dataset for the day
function showWeatherGraphForDay(day: Moment.Moment, data: WeatherDataSeries): boolean {
  const weather = Object.values(data);
  if (weather.length === 0) return false;
  const endOfDay = Moment(day).endOf('day');
  const lastKnown: HourForecast = maxBy(weather, 'time');
  const lastMoment = Moment(lastKnown.time);
  return lastMoment.isAfter(endOfDay);
}

function mapStateToProps(state: AppStore) {
  return {
    forecast: state.Forecast,
  };
}

// export default Dag;
export default connect(mapStateToProps)(Dag);
