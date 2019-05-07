import * as React from 'react';
import Moment from 'moment';
import firebase from './firebase';

Moment.locale('nb');

interface State {
  time: Moment.Moment;
  debug: boolean;
}

class Clock extends React.PureComponent<{}, State> {
  public constructor(props: {}) {
    super(props);
    this.state = { time: Moment(), debug: false };
  }

  public componentDidMount() {
    setInterval(() => this.setState({ time: Moment() }), 1000);
  }

  public render() {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
        onClick={() => this.setState({ debug: !this.state.debug })}
      >
        <span
          style={{
            alignItems: 'center',
            color: '#ffffff',
            fontSize: 90,
            fontWeight: 200,
          }}
        >
          {this.state.time.format('HH:mm')}
        </span>
        <span style={{ color: '#ffffff', fontSize: 35, fontWeight: 100 }}>
          {!this.state.debug && this.state.time.format('dddd Do MMMM')}
        </span>
        {this.state.debug && (
          <span>
            <button type="button" onClick={() => firebase.auth().signOut()}>
              Logg ut
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              Last inn på nytt
            </button>
          </span>
        )}
      </div>
    );
  }
}

export default Clock;
