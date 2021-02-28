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
  unitSpace: boolean;
  color: string;
  colorIfNegative: string;
  labelColor: string;
  header: string | undefined;
  headerIfNegative: string | undefined;
  unit: string | undefined;
  invertValue: boolean;
  absoluteValue: boolean;
  smartRoundKw: boolean;
}

export function roundToNumberOfDecimals(number: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(factor * number) / factor;
}

class TellulfInfoCell extends React.PureComponent<Props, GenericProps> {
  public static defaultProps = {
    header: undefined,
    headerIfNegative: undefined,
    info: '-',
    large: false,
    fontSize: defaultFontSize,
    decimals: 0,
    unit: '',
    unitSpace: false,
    color: '#FFFFFF',
    labelColor: '#777777',
    colorIfNegative: '#FFFFFF',
    invertValue: false,
    absoluteValue: false,
    smartRoundKw: false,
  };

  smartRoundWatt(number: number): string {
    const rounded = Math.round(number);
    const space = this.props.unitSpace ? ' ' : '';
    if (rounded === 0) return '-';
    if (Math.abs(rounded) < 100) return `${rounded.toLocaleString()}`;
    return `${(Math.round(rounded / 100) / 10).toLocaleString()}${space}k`;
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

      // Text to show
      if (this.props.smartRoundKw) {
        text = this.smartRoundWatt(valToDisplay);
      } else {
        text = roundToNumberOfDecimals(valToDisplay, this.props.decimals).toLocaleString();
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

    const space = this.props.unitSpace ? ' ' : null;
    const color = this.props.info >= 0 ? this.props.color : this.props.colorIfNegative;

    let header = this.props.header;
    if (this.props.info < 0 && this.props.headerIfNegative !== undefined) {
      header = this.props.headerIfNegative;
    }

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'spaceAround',
          alignItems: 'center',
          fontSize,
        }}
      >
        {this.props.header && (
          <span style={{ fontSize: labelFontSize, color: this.props.labelColor }}>{header}</span>
        )}
        <span style={{ color }}>
          {text}
          {space}
          {this.props.unit}
        </span>
      </div>
    );
  }
}

export default TellulfInfoCell;
