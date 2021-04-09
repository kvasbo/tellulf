import React from 'react';
import { AppStore } from '../redux/reducers';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import { GenericProps } from '../types/generic';
import { HourForecast, ForecastPlace } from '../types/forecast';

const baseUrl = '/weather_symbols';

interface Props {
  forecast: HourForecast;
  time: number;
  durationInHours: 1 | 6;
  place: ForecastPlace;
}

class WeatherUnit extends React.PureComponent<Props, GenericProps> {
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

    return <span>{forecast.rain} mm</span>;
  }

  private static getTime(forecast: HourForecast): string {
    const from = DateTime.fromMillis(forecast.time).toFormat('HH');
    const to = DateTime.fromMillis(forecast.time)
      .plus({ hours: forecast.durationInHours })
      .toFormat('HH');

    return `${from}-${to}`;
  }

  public render(): React.ReactNode {
    return (
      <div className="weatherCell">
        <span>{WeatherUnit.getIcon(this.props.forecast.symbol)}</span>
        <span className="weatherCellLine subInfo">{WeatherUnit.getTime(this.props.forecast)}</span>
        <span className="weatherCellLine bigInfo">{this.props.forecast.temp}&deg;</span>
        <span className="weatherCellLine rain">{WeatherUnit.getRain(this.props.forecast)}</span>
      </div>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    yr: state.Yr,
  };
}

// export default Dag;
export default connect(mapStateToProps)(WeatherUnit);
