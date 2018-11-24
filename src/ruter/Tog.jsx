import React from 'react';
import PropTypes from 'prop-types';

const secondsToShow = 3600;
const totalWidth = 766;
const pixelsPerSecond = totalWidth / secondsToShow;

export default class Tog extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { showTime: false };
  }

  getStyles() {
    const styles = {};
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

  getText() {
    if (this.state.showTime) {
      return this.props.info.faktiskTid.format('HH:MM');
    }
    return this.props.info.fromNowM;
  }

  showTime() {
    this.setState(prevState => ({ showTime: !prevState.showTime }));
  }

  render() {
    return (
      <div className="train" style={this.getStyles()} onClick={() => this.showTime()}>{this.getText()}</div>
    );
  }
}

Tog.propTypes = {
  info: PropTypes.object.isRequired,
};
