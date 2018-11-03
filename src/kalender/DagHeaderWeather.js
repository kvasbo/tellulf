import React from 'react';
import Moment from 'moment';
import SunCalc from 'suncalc';
// import Image from 'react-native-remote-svg'
// import weatherSymbols from '../weatherIcons';

class DagHeaderWeather extends React.PureComponent {
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
      <div style={{ flexDirection: 'row', flex: 1 }}>
        { renderWeatherCell(weather.first) }
        { renderWeatherCell(weather.second) }
        { renderWeatherCell(weather.third) }
        { renderWeatherCell(weather.fourth) }
      </div>
    );
  }
}

function renderWeatherCell(data) {
  if (!data) return <div style={{ flex: 1 }} />;
  const icon = getIcon(data);
  return (
    <div style={{ flex: 1, justifyContent: 'center', flexDirection: 'row', margin: 5, padding: 0 }}>
      <div style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
        
      </div>
      <div style={{ marginLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ color: '#FFFFFF' }}>{Math.round(data.temp)}</div>
      </div>
    </div>
  )
}

function getIcon(data) {
  return null;
  /*
  let icon = weatherSymbols.blank;
  const nattdag = (getDayTime(data)) ? 'day' : 'night';
  if (data.symbol in weatherSymbols[nattdag]) {
    icon = weatherSymbols[nattdag][data.symbol];
  }
  return icon;
  */
}

function getDayTime(data) {
  const time = new Moment(data.time);
  const sunTimes = SunCalc.getTimes(time.toDate(), 59.9409, 10.6991);
  return time.isBetween(sunTimes.dawn, sunTimes.dusk);
}

export default DagHeaderWeather;
