import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import './yr.css';

export default class HourMarker extends Component {
  constructor(props) {
    super(props);
    this.from = new Moment(props.hour.from);
    this.to = new Moment(props.hour.to);
    this.state = {};
  }

  getTime() {
    return new Moment(this.props.hour.from).format('H');
  }

  isEndOfDay() {
    const end = new Moment(this.props.hour.to);
    if (end.format('H') === '23' && this.isToday()) return true;
    return false;
  }

  isToday() {
    const end = new Moment(this.props.hour.to);
    return end.isSame(new Moment(), 'day');
  }

  render() {
    return (
      <div className="hourMarker">
        <div className="time" >{this.getTime()}</div>
      </div>
    );
  }
}

HourMarker.propTypes = {
  hour: PropTypes.object.isRequired,
};
