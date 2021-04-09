import React from 'react';
import Moment from 'moment';
import { GenericProps } from '../types/generic';
import { HourForecast } from '../types/forecast';

const baseUrl = '/weather_symbols';

interface Props {
  forecast: HourForecast;
}

export default class WeatherUnit extends React.PureComponent<Props, GenericProps> {
  public constructor(props: Props) {
    super(props);
  }

  private static getIcon(symbol: string): JSX.Element {
    const url = `${baseUrl}/${symbol}.png`;
    return <img src={url} className="weatherSymbol" />;
  }

  private static getRain(forecast: HourForecast): JSX.Element {
    if (!forecast.rain && !forecast.rainMin && !forecast.rainMax) {
      return <span></span>;
    }

    return (
      <span>
        {forecast.rain}mm{' '}
        <span className="subInfo">
          ({forecast.rainMin}-{forecast.rainMax})
        </span>
      </span>
    );
  }

  public render(): React.ReactNode {
    return (
      <div className="weatherCell">
        <span className="weatherCellLine">{WeatherUnit.getIcon(this.props.forecast.symbol)}</span>
        <span className="weatherCellLine temp">{this.props.forecast.temp}&deg;</span>
        <span className="weatherCellLine rain">{WeatherUnit.getRain(this.props.forecast)}</span>
      </div>
    );
  }
}
