import Moment from 'moment';
import { DateTime } from 'luxon';
import React from 'react';
import { connect } from 'react-redux';
import store from 'store';
import { AppStore } from '../redux/reducers';
import { YrStore } from '../types/yr';
import { Event, EventDataSet } from '../types/calendar';
import { ForecastPlace } from '../types/forecast';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';
import WeatherUnit from '../weather/WeatherUnit';

interface Props {
  birthdays: EventDataSet;
  events: EventDataSet;
  date: Moment.Moment;
  yr: YrStore;
}

interface State {
  sted: ForecastPlace;
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

  private loadSted(): ForecastPlace {
    const sted = store.get(`sted_${this.props.date}`, 'oslo');
    return sted;
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

  private getWeather(place: 'oslo' | 'sandefjord'): JSX.Element[] {
    const out: JSX.Element[] = [];

    for (let i = 0; i < 24; i += 6) {
      const time = DateTime.fromMillis(this.props.date.valueOf())
        .plus({ hours: i + 2 })
        .valueOf();

      out.push(<WeatherUnit key={time} time={time} place={place} />);
    }
    return out;
  }

  public render(): React.ReactNode {
    //const stedToShow = this.state.sted !== 'oslo' ? this.state.sted.toLocaleUpperCase() : null;

    return (
      <div className="kalenderDag">
        <div className="kalendarDayInfo">
          <div className="kalenderDato">{getDayHeader(this.props.date)}</div>
          <div className="kalenderHendelser">
            {this.getBirthdays()}
            {this.getEvents()}
          </div>
        </div>
        <div className="weatherCellContainer">{this.getWeather(this.state.sted)}</div>
      </div>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    yr: state.Yr,
  };
}

// export default Dag;
export default connect(mapStateToProps)(Dag);
