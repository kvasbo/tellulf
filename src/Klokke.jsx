import React from 'react';
import Moment from 'moment';

Moment.locale('nb');

class Clock extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { time: Moment(), debug: false };
  }

  componentDidMount() {
    this.timer = setInterval(() => this.setState({ time: Moment() }), 1000);
  }

  render() {
    return (
      <div
        style={{
          display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center',
        }}
        onClick={() => this.setState({ debug: !this.state.debug })}
      >
        <span style={{
          alignItems: 'center', color: '#ffffff', fontSize: 100, fontWeight: '200',
        }}
        >{this.state.time.format('HH:mm')}
        </span>
        <span
          style={{ color: '#ffffff', fontSize: 35, fontWeight: '100' }}
        >{this.state.time.format('dddd Do MMMM')}
        </span>
        { this.state.debug && <span><img alt="pipeline status" src="https://gitlab.com/kvasbo/tellulf-client/badges/master/pipeline.svg" /><button type="button" onClick={() => window.location.reload()}>Last inn på nytt</button></span>}
      </div>
    );
  }
}

export default Clock;
