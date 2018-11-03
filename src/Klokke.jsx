import React from 'react';
import Moment from 'moment';

Moment.locale('nb');

class Clock extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { time: Moment() };
  }

  componentDidMount() {
    this.timer = setInterval(() => this.setState({ time: Moment() }), 1000);
  }

  render() {
    return (
      <div style={{ paddingBottom: 20, paddingTop: 20, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }} >
        <div style={{ color: '#ffffff', fontSize: 100, fontWeight: '200' }}>{this.state.time.format("HH:mm")}</div>
        <div style={{ color: '#ffffff', fontSize: 40, fontWeight: '200' }}>{this.state.time.format("dddd Do MMMM")}</div>
      </div>
    );
  }
}

export default Clock;
