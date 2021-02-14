import Moment from 'moment';
import * as React from 'react';

Moment.locale('nb');

interface State {
  time: Moment.Moment;
}

interface Props {
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
      <div className="clockTime" onClick={() => this.props.onClick()}>
        {this.state.time.format('HH:mm')}
      </div>
    );
  }
}

export default Clock;
