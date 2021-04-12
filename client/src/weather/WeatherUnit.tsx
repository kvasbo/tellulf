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
  prevTemp: number | undefined;
  nextTemp: number | undefined;
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

    return (
      <span className="subInfo">
        {forecast.rainMin}-{forecast.rainMax} mm
      </span>
    );
  }

  private static getRainProb(forecast: SixHourForecast): JSX.Element {
    if (!forecast.rain && !forecast.rainMin && !forecast.rainMax) {
      return <span></span>;
    }

    return <span className="subInfo">{Math.round(forecast.rainProbability)}%</span>;
  }

  private static getTimeFormatted(time: number): string {
    const from = DateTime.fromMillis(time).toFormat('HH');
    const to = DateTime.fromMillis(time).plus({ hours: 6 }).toFormat('HH');

    return `${from}-${to}`;
  }

  private getForecastData(): SixHourForecast | null {
    const key = DateTime.fromMillis(this.props.time).valueOf();
    const nextKey = DateTime.fromMillis(this.props.time).plus({ hours: 6 }).valueOf();
    const prevKey = DateTime.fromMillis(this.props.time).minus({ hours: 6 }).valueOf();

    if (!this.props.yr[this.props.place] || !this.props.yr[this.props.place][key]) {
      return null;
    }

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

    const prevTemp = this.props.yr[this.props.place][prevKey]?.data?.next_6_hours?.details
      ?.air_temperature_max;
    const nextTemp = this.props.yr[this.props.place][nextKey]?.data?.next_6_hours?.details
      ?.air_temperature_max;

    return {
      prevTemp,
      nextTemp,
      tempMax,
      tempMin,
      symbol,
      rain,
      rainMin,
      rainMax,
      rainProbability,
    };
  }

  /**
  Format the temperature
  */
  private static getTempFormatted(forecastData: SixHourForecast): string {
    const from = forecastData.tempMin;
    const to = forecastData.tempMax;

    if (Math.abs(to - from) <= 1) {
      const t = Math.round((to + from) / 2);
      return `${t}°`;
    } else {
      return `${forecastData.tempMax}°/${forecastData.tempMin}°`;
    }
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
          {WeatherUnit.getTempFormatted(forecastData)}
        </span>
        <span className="weatherCellLine rain">{WeatherUnit.getRain(forecastData)}</span>
        <span className="weatherCellLine rain">{WeatherUnit.getRainProb(forecastData)}</span>
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
