import React from 'react';
import Moment from 'moment';
import { GenericProps } from '../types/generic';
import { HourForecast } from '../types/forecast';

interface Props {
  forecast: HourForecast;
  from: Moment.Moment;
  to: Moment.Moment;
}

export default class WeatherPoint extends React.PureComponent<Props, GenericProps> {
  public render(): React.ReactNode {
    return <div className="weatherCell"></div>;
  }
}
