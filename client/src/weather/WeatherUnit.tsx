import React from 'react';
import Moment from 'moment';
import { GenericProps } from '../types/generic';
import { HourForecast } from '../types/forecast';

interface Props {
  forecast: HourForecast;
}

export default class WeatherUnit extends React.PureComponent<Props, GenericProps> {
  public constructor(props: Props) {
    super(props);
  }

  public render(): React.ReactNode {
    return (
      <div className="weatherCell">
        <span className="symbol">{this.props.forecast.symbol}</span>
        <span className="temp">{this.props.forecast.temp}</span>
        <span className="rain">{this.props.forecast.rain}</span>
        <span className="rainMin">{this.props.forecast.rainMin}</span>
        <span className="rainMax">{this.props.forecast.rainMax}</span>
      </div>
    );
  }
}
