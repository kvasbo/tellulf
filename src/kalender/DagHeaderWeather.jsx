import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import SunCalc from 'suncalc';
import symbols from '../weather/symbols';

export default class DayHeaderWeather extends Component {

  getDayTime(data) {
    const time = new Moment(data.time);
    const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
    return time.isBetween(sunTimes.dawn, sunTimes.dusk);
  }

  getIcon(data) {
    let icon = 'blank.svg';
    const nattdag = (this.getDayTime(data)) ? 'dag' : 'natt';
    if (data.symbol in symbols) {
      icon = `${symbols[data.symbol]}.svg`;
    }
    const returnStr = `icons/${nattdag}/${icon}`;
    return returnStr;
  }


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

  renderWeatherCell(data) {
    if (!data) return (<div style={{ flex: 1 }}/>)
    const icon = this.getIcon(data);
    return (
      <div style={{ fontSize: 14, color: '#ffffff88', flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={icon} width={20} height={20} />
        </div>
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {Math.round(data.temp)}
        </div>
      </div>
    )
  }

  render() {
    if (this.props.weather.length === 0) return null;
    const weather = this.getWeatherData();
    console.log(weather);
    return (
      <div style={{ flexDirection: 'row', display: 'flex', flex: 1, padding: 3 }}>
        { this.renderWeatherCell(weather.first) }
        { this.renderWeatherCell(weather.second) }
        { this.renderWeatherCell(weather.third) }
        { this.renderWeatherCell(weather.fourth) }
      </div>
    );
  }
}
