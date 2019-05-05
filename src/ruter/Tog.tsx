import React from 'react';
import { ExtendedTrainData } from '../types/trains';
import { Style } from '../types/generic';

const secondsToShow = 3600;
const totalWidth = 800;
const pixelsPerSecond: number = totalWidth / secondsToShow;

interface Props {
  info: ExtendedTrainData;
}

interface State {
  showTime: boolean;
}

export default class Tog extends React.PureComponent<Props, {}> {
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = { showTime: false };
  }

  getStyles(): Style {
    const styles: Style = {};
    const leftPos = Math.round(this.props.info.fromNow * pixelsPerSecond);
    styles.left = leftPos;
    if (this.props.info.fromNowM < 7) {
      styles.borderColor = 'rgb(30,30,30)';
      styles.color = 'rgb(130,130,130)';
      styles.backgroundColor = 'rgb(0,0,0)';
    }
    if (this.props.info.ruteDiff > 3) {
      styles.borderColor = 'red';
    }
    return styles;
  }

  getText(): string {
    if (this.state.showTime) {
      return this.props.info.faktiskTid.format('HH:MM');
    }
    return this.props.info.fromNowM.toString();
  }

  showTime(): void {
    this.setState((prevState: State) => ({ showTime: !prevState.showTime }));
  }

  render() {
    return (
      <div className="train" style={this.getStyles()} onClick={() => this.showTime()}>
        {this.getText()}
      </div>
    );
  }
}
