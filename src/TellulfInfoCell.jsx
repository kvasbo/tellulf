import React from 'react';
import PropTypes from 'prop-types';

const defaultFontSize = 16;
const largeFontSize = 24;
const labelFontSize = 10;

const cellStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-around',
  alignItems: 'center',
};

class TellulfInfoCell extends React.PureComponent {
  render() {
    let text = '-';

    // Don't even try
    if (Number.isNaN(this.props.info)) {
      return null;
    }

    text = roundToNumberOfDecimals(this.props.info, this.props.decimals).toLocaleString();

    // Figure out the font size!
    let { fontSize } = this.props;
    // Not explicitly set, but large!
    if (this.props.fontSize === defaultFontSize && this.props.large) {
      fontSize = largeFontSize;
    }

    const space = (this.props.unitSpace) ? ' ' : null;
    const color = (this.props.info >= 0) ? this.props.color : this.props.colorIfNegative;

    return (
      <div style={{ ...cellStyle, fontSize }}>
        {this.props.header && <span style={{ fontSize: labelFontSize, color: this.props.labelColor }}>{this.props.header}</span>}
        <span style={{ color }}>{text}{space}{this.props.unit}</span>
      </div>
    );
  }
}

TellulfInfoCell.defaultProps = {
  header: undefined,
  info: '-',
  large: false,
  fontSize: defaultFontSize,
  decimals: 0,
  unit: null,
  unitSpace: false,
  color: '#FFFFFF',
  labelColor: '#777777',
  colorIfNegative: '#FFFFFF',
};

TellulfInfoCell.propTypes = {
  header: PropTypes.string,
  info: PropTypes.number,
  large: PropTypes.bool,
  fontSize: PropTypes.number,
  decimals: PropTypes.number,
  unit: PropTypes.string,
  unitSpace: PropTypes.bool,
  color: PropTypes.string,
  labelColor: PropTypes.string,
  colorIfNegative: PropTypes.string,
};

export function roundToNumberOfDecimals(number, decimals) {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

export default TellulfInfoCell;
