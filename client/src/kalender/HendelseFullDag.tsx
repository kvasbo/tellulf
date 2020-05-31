import React from 'react';
import { getTimeString } from './HendelseMedTid';
import { Event } from '../types/calendar';
import { GenericProps } from '../types/generic';

import './kalender.css';

interface Props {
  data: Event;
}

class HendelseFullDag extends React.PureComponent<Props, GenericProps> {
  public render(): React.ReactNode {
    return (
      <div className="kalenderSubInfo">
        <div>{this.props.data.name}</div>
        {!this.props.data.oneDay && <div>{getTimeString(this.props.data)}</div>}
      </div>
    );
  }
}

export default HendelseFullDag;
