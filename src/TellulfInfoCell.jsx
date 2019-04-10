import React from 'react';
import PropTypes from 'prop-types';

const cellStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
};

const headerStyle = {
  fontSize: 12,
  color: '#777777',
};

class TellulfInfoCell extends React.PureComponent {
  render() {
    let text = '-';
    let unit = '';
    if (this.props.info || this.props.info === 0) {
      // eslint-disable-next-line prefer-destructuring
      unit = this.props.unit;
      if (!Number.isNaN(this.props.info)) {
        text = roundToNumberOfDecimals(this.props.info, this.props.decimals).toLocaleString();
      } else {
        text = this.props.info;
      }
    }

    const fontSize = (this.props.large) ? 24 : 16;
    return (
      <div style={{ ...cellStyle, fontSize }}>
        {this.props.header && <span style={headerStyle}>{this.props.header}</span>}
        <span>{text}{unit}</span>
      </div>
    );
  }
}

TellulfInfoCell.defaultProps = {
  header: undefined,
  info: '-',
  large: false,
  decimals: 0,
  unit: null,
};

TellulfInfoCell.propTypes = {
  header: PropTypes.string,
  info: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  large: PropTypes.bool,
  decimals: PropTypes.number,
  unit: PropTypes.string,
};

function roundToNumberOfDecimals(number, decimals) {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

export default TellulfInfoCell;
