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
      <div style={{
        display: 'flex', flex: 1, height: '100%', flexDirection: 'column', backgroundColor: '#000000', justifyContent: 'space-evenly', alignItems: 'center',
      }}
      >
        <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center', display: 'flex', color: '#ffffff', fontSize: 100, paddingTop: 30, fontWeight: '200' }}>{this.state.time.format('HH:mm')}</div>
        <div style={{ flex: 0.7, color: '#ffffff', fontSize: 35, fontWeight: '100' }}>{this.state.time.format('dddd Do MMMM')}</div>
      </div>
    );
  }
}

export default Clock;
