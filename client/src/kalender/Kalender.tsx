import React from 'react';
import { connect } from 'react-redux';
import Moment from 'moment';
import sortBy from 'lodash/sortBy';
import maxBy from 'lodash/maxBy';
import Dag from './Dag';

import { getIcal } from './kalenderHelpers';
import { IcalParseResult } from '../types/calendar';
import { AppStore } from '../redux/reducers';
import { ForecastStore, HourForecast } from '../types/forecast';

const proxy = 'https://us-central1-tellulf-151318.cloudfunctions.net/proxy';

const calUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_ognucfh1asvpgc50mqms5tu0kk%40group.calendar.google.com/private-7020f002efde8095cc911279983fb92a/basic.ics';

const dinnerUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_m3le0buqs8k24ljlumcr1goqqs%40group.calendar.google.com/private-43f7d258dce12c6117d133b621318148/basic.ics';

const birthdayUrl =
  'https://calendar.google.com/calendar/ical/kvasbo.no_upelraeuo31neuoq31f9decudg%40group.calendar.google.com/private-6718a3a9f7b74d60372a3f2be75804d6/basic.ics';

const cal = encodeURIComponent(calUrl);
const dinner = encodeURIComponent(dinnerUrl);
const birthday = encodeURIComponent(birthdayUrl);

const calP = `${proxy}/?url=${cal}`;
const dinP = `${proxy}/?url=${dinner}`;
const bdP = `${proxy}/?url=${birthday}`;

interface State {
  kalenderData: IcalParseResult;
  birthdays: IcalParseResult;
  dinners: IcalParseResult;
}

interface Props {
  forecast: ForecastStore;
}

class Kalender extends React.PureComponent<Props, State> {
  private interval = 0;
  public constructor(props: Props) {
    super(props);
    this.state = {
      kalenderData: {},
      dinners: {},
      birthdays: {},
    };
  }

  public componentDidMount() {
    this.updateData();
    this.interval = window.setInterval(() => this.updateData(), 1000 * 60);
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  private getDays() {
    const out: JSX.Element[] = [];
    const start = Moment().startOf('day');
    const now = start.clone();
    const days: Moment.Moment[] = [];

    // Prime the data set
    for (let i = 0; i < 30; i += 1) {
      days.push(start.clone());
      start.add(1, 'days');
    }

    days.forEach((day) => {
      const d = day.format('YYYY-MM-DD');
      const diff = day.diff(now, 'days');
      const cald = this.state.kalenderData[d];
      const birthdays = this.state.birthdays[d];
      const dinners = this.state.dinners[d];
      const filteredForecast = this.filterForecast(day, 'oslo');
      const filteredForecastHytta = this.filterForecast(day, 'sandefjord');
      const showWeather = this.showWeatherForDay(day);

      if (diff < 14 || cald || birthdays || dinners) {
        out.push(
          <Dag
            key={`kalenderdag${d}`}
            date={d}
            events={cald}
            dinner={dinners}
            birthdays={birthdays}
            showWeather={showWeather}
            forecastData={filteredForecast}
            forecastDataHytta={filteredForecastHytta}
          />,
        );
      }
    });
    return out;
  }

  // CHeck if we have a full dataset for the day
  private showWeatherForDay(day: Moment.Moment): boolean {
    if (!this.props.forecast.data || !this.props.forecast.data['oslo']) return false;
    const endOfDay = Moment(day).endOf('day');
    const w = Object.values(this.props.forecast.data['oslo'].forecast);
    const lastKnown: HourForecast = maxBy(w, 'time');
    const lastMoment = Moment(lastKnown.time);
    return lastMoment.isAfter(endOfDay);
  }

  private filterForecast(date: Moment.Moment, sted: string): HourForecast[] {
    if (!this.props.forecast.data || !this.props.forecast.data[sted]) return [];
    const from = Moment(date).startOf('day').subtract(6, 'h');
    const to = Moment(date).endOf('day').add(6, 'h');

    const weather = this.props.forecast.data[sted].forecast;

    const weatherFiltered: HourForecast[] = Object.values(weather).filter((w: HourForecast) => {
      return Moment(w.time).isBetween(from, to, undefined, '[]');
    });

    const weatherSorted: HourForecast[] = sortBy(weatherFiltered, 'time');

    return weatherSorted;
  }

  private async updateData() {
    try {
      const kalenderData = await getIcal(calP);
      const dinners = await getIcal(dinP);
      const birthdays = await getIcal(bdP);
      this.setState({ kalenderData, dinners, birthdays });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  }

  public render() {
    return <div style={{ flex: 1, overflow: 'auto' }}>{this.getDays()}</div>;
  }
}

function mapStateToProps(state: AppStore) {
  return {
    forecast: state.Forecast,
  };
}

export default connect(mapStateToProps)(Kalender);
