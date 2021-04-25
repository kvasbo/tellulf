import React from 'react';
import { GenericProps } from './types/generic';

const defaultFontSize = 16;
const largeFontSize = 24;
const labelFontSize = 10;

interface Props {
  info: number;
  decimals: number;
  fontSize: number;
  large: boolean;
  header: string | undefined;
  headerIfNegative: string | undefined;
  unit: string | undefined;
  invertValue: boolean;
  absoluteValue: boolean;
  smartRoundKw: boolean;
}

interface roundedNumber {
  number: string;
  unit: string;
}

export function roundToNumberOfDecimals(number: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

class TellulfInfoCell extends React.PureComponent<Props, GenericProps> {
  public static defaultProps = {
    header: undefined,
    headerIfNegative: undefined,
    info: '',
    large: false,
    fontSize: defaultFontSize,
    decimals: 0,
    unit: '',
    unitSpace: false,
    invertValue: false,
    absoluteValue: false,
    smartRoundKw: false,
  };

  smartRoundWatt(number: number): roundedNumber {
    const out = { number: '-', unit: '' };

    if (Math.abs(number) > 1000) {
      out.number = Math.round(number / 1000).toLocaleString();
      out.unit = 'k';
    } else if (Math.abs(number) > 100) {
      out.number = (Math.round(number / 100) / 10).toLocaleString();
      out.unit = 'k';
    } else {
      out.number = Math.round(number).toLocaleString();
    }
    return out;
  }

  public render(): React.ReactNode {
    let text = '-';
    if (typeof this.props.info === 'number') {
      // Don't even try
      if (Number.isNaN(this.props.info)) {
        return null;
      }

      // Invert?
      let valToDisplay = !this.props.invertValue ? this.props.info : this.props.info * -1;

      // absolute?
      if (this.props.absoluteValue) {
        valToDisplay = Math.abs(valToDisplay);
      }

      let unitMultiplier = '';

      // Text to show
      if (this.props.smartRoundKw) {
        const data = this.smartRoundWatt(valToDisplay);
        unitMultiplier = data.unit;
        text = data.number + ' ' + unitMultiplier + this.props.unit;
      } else {
        text =
          roundToNumberOfDecimals(valToDisplay, this.props.decimals).toLocaleString() +
          ' ' +
          this.props.unit;
      }
    } else if (typeof this.props.info === 'string') {
      text = this.props.info;
    }

    // Figure out the font size!
    let { fontSize } = this.props;
    // Not explicitly set, but large!
    if (this.props.fontSize === defaultFontSize && this.props.large) {
      fontSize = largeFontSize;
    }

    let header = this.props.header;
    if (this.props.info < 0 && this.props.headerIfNegative !== undefined) {
      header = this.props.headerIfNegative;
    }

    return (
      <div
        className="infoBox"
        style={{
          fontSize,
        }}
      >
        {this.props.header && (
          <span style={{ fontSize: labelFontSize, marginBottom: 3 }}>{header}</span>
        )}
        {text}
      </div>
    );
  }
}

export default TellulfInfoCell;
