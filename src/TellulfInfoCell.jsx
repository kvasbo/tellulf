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

    // Don't even try
    if (Number.isNaN(this.props.info)) {
      return null;
    }

    text = roundToNumberOfDecimals(this.props.info, this.props.decimals).toLocaleString();

    const fontSize = (this.props.large) ? 24 : 16;
    const space = (this.props.unitSpace) ? ' ' : null;
    return (
      <div style={{ ...cellStyle, fontSize }}>
        {this.props.header && <span style={headerStyle}>{this.props.header}</span>}
        <span>{text}{space}{this.props.unit}</span>
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
  unitSpace: false,
};

TellulfInfoCell.propTypes = {
  header: PropTypes.string,
  info: PropTypes.number,
  large: PropTypes.bool,
  decimals: PropTypes.number,
  unit: PropTypes.string,
  unitSpace: PropTypes.bool,
};

export function roundToNumberOfDecimals(number, decimals) {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

export default TellulfInfoCell;
