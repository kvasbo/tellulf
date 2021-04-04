import React from 'react';
import { HourForecast } from '../types/forecast';
import { GenericProps } from '../types/generic';
const baseUrl = '/weather_symbols';
// const iconBase = '/weather_icons';

interface Props {
  forecast: HourForecast[];
  payload: {
    time: number;
    symbol: string;
    temp: number;
    rain: number;
    rainMin: number;
    rainMax: number;
  };
  cx: number;
  cy: number;
  index: number;
}

class WeatherIcon extends React.PureComponent<Props, GenericProps> {
  private width = 0;
  public static defaultProps = {
    cx: undefined,
    cy: undefined,
    payload: undefined,
    index: undefined,
  };

  public constructor(props: Props) {
    super(props);
    this.width = window.innerWidth;
  }

  private getIconLocation() {
    const icon = `${baseUrl}/${this.props.payload.symbol}.png`;
    return icon;
  }

  /*
  private static getIconUrl(symbol: string): string {
    // const data = symbol.split('_');
    const icon = 'alien';
    return `${iconBase}/wi-${icon}.svg`;
  }
  */

  private getTemp() {
    const temp = Math.round(this.props.payload.temp);
    return temp;
  }

  private getRain(): string {
    const rain = Math.round(this.props.payload.rain * 10);
    const minRain = Math.round(this.props.payload.rainMin * 10);
    const maxRain = Math.round(this.props.payload.rainMax * 10);
    if (rain > 0 || maxRain > 0) {
      return `${rain.toString()} mm (${minRain.toString()}-${maxRain.toString()})`;
    }
    return '';
  }

  public render(): React.ReactNode {
    if (isNaN(this.props.payload.temp) || typeof this.props.payload.symbol === 'undefined') {
      return null;
    }
    if (this.width <= 600) {
      const d = new Date(this.props.payload.time);
      if (d.getHours() % 2 !== 0) return null;
    }

    // const iconUrl = WeatherIcon.getIconUrl(this.props.payload.symbol);

    return (
      <svg>
        <text
          x={this.props.cx}
          y={this.props.cy + 21}
          textAnchor="middle"
          // fontFamily="sans-serif"
          fontSize="13px"
          fill="#ffffff99"
        >
          {this.getTemp()}
        </text>
        <text
          x={this.props.cx}
          y={this.props.cy - 18}
          textAnchor="middle"
          // fontFamily="sans-serif"
          fontSize="13px"
          fill="#ffffff99"
        >
          {this.getRain()}
        </text>
        <image
          href={this.getIconLocation()}
          //href={iconUrl}
          x={this.props.cx - 13}
          y={this.props.cy - 15}
          height="26px"
          width="26px"
          //filter={'invert(100%)'}
        />
        )
      </svg>
    );
  }
}

export default WeatherIcon;
