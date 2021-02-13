import React from 'react';
import { GenericProps } from '../types/generic';
import { ExtendedTrainData } from '../types/trains';

interface Props {
  trains: ExtendedTrainData[];
}

class Rute extends React.PureComponent<Props, GenericProps> {
  public render() {
    // eslint-disable-next-line no-console
    // console.log(this.props.trains);
    return null;
  }
}

export default Rute;
