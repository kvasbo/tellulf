import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import SunCalc from 'suncalc';
import symboler from '../weather/symboler';

export default class DayHeaderWeather extends Component {
  getWeatherData() {
    const first = this.props.weather.filter((w) => {
      const t = Moment(w.time);
      return (t.hours() >= 0 && t.hours() <= 6);
    });
    const second = this.props.weather.filter((w) => {
      const t = Moment(w.time);
      return (t.hours() > 6 && t.hours() <= 12);
    });
    const third = this.props.weather.filter((w) => {
      const t = Moment(w.time);
      return (t.hours() > 12 && t.hours() <= 18);
    });
    const fourth = this.props.weather.filter((w) => {
      const t = Moment(w.time);
      return (t.hours() > 18 && t.hours() <= 23);
    });
    const out = {};
    out.first = (first[0]) ? first[0] : null;
    out.second = (second[0]) ? second[0] : null;
    out.third = (third[0]) ? third[0] : null;
    out.fourth = (fourth[0]) ? fourth[0] : null;
    return out;
  }

  render() {
    if (this.props.weather.length === 0) return null;
    const weather = this.getWeatherData();
    return (
      <div style={{ flexDirection: 'row', display: 'flex', flex: 1 }}>
        { renderWeatherCell(weather.first) }
        { renderWeatherCell(weather.second) }
        { renderWeatherCell(weather.third) }
        { renderWeatherCell(weather.fourth) }
      </div>
    );
  }
}

function renderWeatherCell(data) {
  if (!data) return (<div style={{ display: 'flex', flex: 1 }} />);
  const icon = getIcon(data);
  return (
    <div style={{ display: 'flex', flex: 1, overFlow: 'hidden', fontSize: 14, color: '#ffffff88', justifyContent: 'center', flexDirection: 'row', marginTop: '0.4vh' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src={icon} width={20} height={20} alt="" />
      </div>
      <div style={{ display: 'flex', marginLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
        {Math.round(data.temp)}
      </div>
    </div>
  )
}

function getIcon(data) {
  let icon = symboler.blank;
  const nattdag = (getDayTime(data)) ? 'day' : 'night';
  if (data.symbol in symboler[nattdag]) {
    icon = symboler[nattdag][data.symbol];
  }
  return icon;
}

function getDayTime(data) {
  const time = new Moment(data.time);
  const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
  return time.isBetween(sunTimes.dawn, sunTimes.dusk);
}

DayHeaderWeather.propTypes = {
  weather: PropTypes.array.isRequired,
};
