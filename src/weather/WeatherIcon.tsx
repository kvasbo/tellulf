import React from 'react';
const baseUrl = './WeatherIcons/';

interface props {
  symbolMap: any;
  payload: any;
  sunrise: number;
  sunset: number;
  cx: number;
  cy: number;
}

class WeatherIcon extends React.PureComponent<props, {}> {

  public static defaultProps = {
    cx: undefined,
    cy: undefined,
    payload: undefined,
    sunrise: 0,
    sunset: 3484811880000,
  }

  getIconLocation() {
    let icon = this.props.symbolMap.blank;
    const nattdag = (this.props.payload.time % 86400000 >= this.props.sunrise % 86400000 && this.props.payload.time % 86400000 <= this.props.sunset % 86400000) ? 'day' : 'night';
    if (this.props.payload.symbol in this.props.symbolMap[nattdag]) {
      icon = this.props.symbolMap[nattdag][this.props.payload.symbol];
    }
    return `${baseUrl}${icon}`;
  }

  getTemp() {
    const temp = Math.round(this.props.payload.temp);
    return temp;
  }

  render() {
    if (!this.props.cy) {
      return null;
    }
    return (
      <svg>
        <text x={this.props.cx} y={this.props.cy + 20} textAnchor="middle" fontFamily="sans-serif" fontSize="13px" fill="white">{this.getTemp()}</text>
        <image xlinkHref={this.getIconLocation()} x={this.props.cx - 13} y={this.props.cy - 15} height="26px" width="26px" />
      </svg>
    );
  }
}

export default WeatherIcon;
