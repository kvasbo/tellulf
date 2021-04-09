import React from 'react';
import { AppStore } from '../redux/reducers';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';
import { GenericProps } from '../types/generic';
import { ForecastPlace } from '../types/forecast';
import { YrStore } from '../types/yr';

const baseUrl = '/weather_symbols';

interface SixHourForecast {
  tempMax: number;
  tempMin: number;
  symbol: string;
  rain: number;
  rainMin: number;
  rainMax: number;
  rainProbability: number;
}

interface Props {
  time: number;
  place: ForecastPlace;
  yr: YrStore;
}

class WeatherUnit extends React.PureComponent<Props, GenericProps> {
  public constructor(props: Props) {
    super(props);
  }

  private static getIcon(symbol: string): JSX.Element {
    const url = `${baseUrl}/${symbol}.png`;
    return <img src={url} className="weatherSymbol" />;
  }

  private static getRain(forecast: SixHourForecast): JSX.Element {
    if (!forecast.rain && !forecast.rainMin && !forecast.rainMax) {
      return <span></span>;
    }

    return <span>{forecast.rain} mm</span>;
  }

  private static getTimeFormatted(time: number): string {
    const from = DateTime.fromMillis(time).toFormat('HH');
    const to = DateTime.fromMillis(time).plus({ hours: 6 }).toFormat('HH');

    return `${from}-${to}`;
  }

  private getForecastData(): SixHourForecast | null {
    const key = DateTime.fromMillis(this.props.time).valueOf();
    const raw = this.props.yr[this.props.place][key];

    if (!raw || !raw.data.next_6_hours) {
      return null;
    }

    const tempMax = Math.round(raw.data.next_6_hours.details.air_temperature_max);
    const tempMin = Math.round(raw.data.next_6_hours.details.air_temperature_min);
    const symbol = raw.data.next_6_hours.summary.symbol_code;
    const rain = raw.data.next_6_hours.details.precipitation_amount;
    const rainMin = raw.data.next_6_hours.details.precipitation_amount_min;
    const rainMax = raw.data.next_6_hours.details.precipitation_amount_max;
    const rainProbability = raw.data.next_6_hours.details.probability_of_precipitation;

    return {
      tempMax,
      tempMin,
      symbol,
      rain,
      rainMin,
      rainMax,
      rainProbability,
    };
  }

  public render(): React.ReactNode {
    const forecastData = this.getForecastData();

    if (forecastData === null) {
      return null;
    }

    return (
      <div className="weatherCell">
        <span className="weatherCellLine subInfo">
          {WeatherUnit.getTimeFormatted(this.props.time)}
        </span>
        <span>{WeatherUnit.getIcon(forecastData.symbol)}</span>
        <span className="weatherCellLine bigInfo">
          {forecastData.tempMin}&deg;/{forecastData.tempMax}&deg;
        </span>
        <span className="weatherCellLine rain">{WeatherUnit.getRain(forecastData)}</span>
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
