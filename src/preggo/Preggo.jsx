import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MainListItem from '../components/MainListItemFour';
import Preg from './preg';

export default class Preggo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      percent: 0,
      week: 0,
      day: 0,
      dayOfWeek: 0,
      height: 0,
      weight: 0,
      left: 0,
    };
    this.preggo = new Preg(this.props.start);
  }

  componentWillMount() {
    setInterval(() => { this.update(); }, 5000);
    this.update();
    console.log('Preggo mounted');
  }

  update() {
    const data = this.preggo.getCalculations();

    const percent = data.percent.toFixed(2);

    this.setState({
      percent,
      week: data.week,
      day: data.day,
      dayOfWeek: data.dayOfWeek,
      height: data.height,
      weight: data.weight,
      left: data.left,
    });
  }

  render() {
    const subs = [
      `u ${this.state.week} d ${this.state.dayOfWeek}`,
      `${this.state.day} / ${this.state.left}`,
      `${this.state.height} cm`,
      `${this.state.weight}g`,
    ];

    return (
      <MainListItem mainItem={this.state.percent} unit="%" subItems={subs} />
    );
  }
}

Preggo.propTypes = {
  start: PropTypes.object.isRequired,
};
