import { DateTime } from 'luxon';
import * as React from 'react';

interface State {
  time: DateTime;
}

interface Props {
  onClick?(): void;
}

class Clock extends React.PureComponent<Props, State> {
  private timeout = 0;

  public constructor(props: Props) {
    super(props);
    this.state = { time: DateTime.now() };
  }

  public componentDidMount(): void {
    // Change on next
    const timeToChange =
      DateTime.now().startOf('minute').plus({ minutes: 1 }).valueOf() - DateTime.now().valueOf();
    this.timeout = window.setTimeout(() => this.setState({ time: DateTime.now() }), timeToChange);
  }

  public componentWillUnmount(): void {
    window.clearTimeout(this.timeout);
  }

  public render(): React.ReactNode {
    return <div className="clockTime">{this.state.time.toFormat('HH:mm')}</div>;
  }
}

export default Clock;
