import React from 'react';

const defaultFontSize = 16;
const largeFontSize = 24;
const labelFontSize = 10;

interface props {
  info: number;
  decimals: number;
  fontSize: number;
  large: boolean;
  unitSpace: boolean;
  color: string;
  colorIfNegative: string;
  labelColor: string;
  header: string | undefined;
  unit: string | undefined;
}

class TellulfInfoCell extends React.PureComponent<props, {}> {

  public static defaultProps = {
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'spaceAround', alignItems: 'center', fontSize }}>
        {this.props.header && <span style={{ fontSize: labelFontSize, color: this.props.labelColor }}>{this.props.header}</span>}
        <span style={{ color }}>{text}{space}{this.props.unit}</span>
      </div>
    );
  }
}

export function roundToNumberOfDecimals(number: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

export default TellulfInfoCell;
