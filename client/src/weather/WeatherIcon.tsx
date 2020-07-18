import React from 'react';
import { GenericProps } from '../types/generic';

const baseUrl = '/weather_symbols';

interface Props {
  payload: { time: number; symbol: string; temp: number };
  cx: number;
  cy: number;
}

class WeatherIcon extends React.PureComponent<Props, GenericProps> {
  private width = 0;
  public static defaultProps = {
    cx: undefined,
    cy: undefined,
    payload: undefined,
  };

  public constructor(props: Props) {
    super(props);
    this.width = window.innerWidth;
  }

  private getIconLocation() {
    const icon = `${baseUrl}/${this.props.payload.symbol}.png`;
    return icon;
  }

  private getTemp() {
    const temp = Math.round(this.props.payload.temp);
    return temp;
  }

  public render(): React.ReactNode {
    if (isNaN(this.props.payload.temp) || typeof this.props.payload.symbol === 'undefined') {
      return null;
    }
    if (this.width <= 600) {
      const d = new Date(this.props.payload.time);
      if (d.getHours() % 2 !== 0) return null;
    }
    return (
      <svg>
        <text
          x={this.props.cx}
          y={this.props.cy + 20}
          textAnchor="middle"
          fontFamily="sans-serif"
          fontSize="13px"
          fill="#ffffff99"
        >
          {this.getTemp()}
        </text>
        <image
          href={this.getIconLocation()}
          x={this.props.cx - 13}
          y={this.props.cy - 15}
          height="26px"
          width="26px"
          opacity={1}
        />
        )
      </svg>
    );
  }
}

export default WeatherIcon;
