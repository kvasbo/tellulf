import React, { Component } from 'react';
import Polar from 'react-polar-clock';
import Moment from 'moment';
import './klokke.css';

export default class Klokke extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: null,
      dato: null,
    };
  }

  componentDidMount() {
    setInterval(() => {
      this.setTid();
    }, 1000);
  }

  setTid() {
    const now = new Moment();
    const time = now.format('HH:mm');
    const dato = now.format('ddd D. MMM');
    this.setState({ time, dato });
  }

  render() {
    // const subs = [this.state.dag, this.state.dato];
    return (
      <div id="klokkeContainer" >
        <div id="polar">
          <Polar size={250} interval={15} colors={{ seconds: '#FF0000', hours: '#00FF00', minutes: '#0000FF' }} />
        </div>
        <div id="clockInnerContainer">
          <div id="tid">{this.state.time}</div>
          <div>
            <div id="dag">{this.state.dato}</div>
          </div>
        </div>
      </div>
    );
  }
}
