import React from 'react';
import { GenericProps } from '../types/generic';
import { ExtendedTrainData, TransportType } from '../types/trains';

interface Props {
  trains: ExtendedTrainData[];
  rutenummer: string;
  type: TransportType;
}

class Rute extends React.PureComponent<Props, GenericProps> {
  public render(): JSX.Element | null {
    // eslint-disable-next-line no-console
    // console.log(this.props.trains);
    return null;
  }
}

export default Rute;
