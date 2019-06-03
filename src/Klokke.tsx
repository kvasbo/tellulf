import * as React from 'react';
import Moment from 'moment';
import firebase from './firebase';

Moment.locale('nb');

interface State {
  time: Moment.Moment;
  debug: boolean;
}

interface Props {
  temp: number;
}

class Clock extends React.PureComponent<Props, State> {
  public constructor(props: { temp: -999 }) {
    super(props);
    this.state = { time: Moment(), debug: false };
  }

  public componentDidMount() {
    setInterval(() => this.setState({ time: Moment() }), 1000);
  }

  public render() {
    console.log(this.props);
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
            fontSize: 75,
            fontWeight: 200,
          }}
        >
          {this.state.time.format('HH:mm')}
        </span>
        <span style={{ color: '#ffffff', fontSize: 35, fontWeight: 100 }}>
          {!this.state.debug && this.props.temp}&deg;
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
