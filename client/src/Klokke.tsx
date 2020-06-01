import * as React from 'react';
import Moment from 'moment';

Moment.locale('nb');

interface State {
  time: Moment.Moment;
}

interface Props {
  temp: number;
  onClick(): void;
}

class Clock extends React.PureComponent<Props, State> {
  private interval = 0;

  public constructor(props: Props) {
    super(props);
    this.state = { time: Moment() };
  }

  public componentDidMount(): void {
    this.interval = window.setInterval(() => this.setState({ time: Moment() }), 1000);
  }

  public componentWillUnmount(): void {
    window.clearInterval(this.interval);
  }

  public render(): React.ReactNode {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
        onClick={() => this.props.onClick()}
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
        <span style={{ color: '#ffffff', fontSize: 55, fontWeight: 100 }}>
          {this.props.temp}&deg;
        </span>
      </div>
    );
  }
}

export default Clock;
