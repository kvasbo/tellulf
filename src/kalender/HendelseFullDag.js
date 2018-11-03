import React from 'react';
import { getTimeString } from './HendelseMedTid';

class HendelseFullDag extends React.PureComponent {
  componentDidMount() {

  }

  render() {
    if (this.props.data.oneDay) {
      return (
        <div style={{ backgroundColor: '#222222', margin: 5, padding: 10, paddingLeft: 15, borderRadius: 25 }}>
          <div style={{ color: '#FFFFFF' }} >{this.props.data.name}</div>
        </div>
      );
    }

    return (
      <div style={{ backgroundColor: '#222222', margin: 5, padding: 10, paddingLeft: 15, borderRadius: 25 }}>
        <div style={{ color: '#FFFFFF' }}>{this.props.data.name}</div>
        <div style={{ color: '#FFFFFF' }}>{getTimeString(this.props.data)}</div>
      </div>
    );
  }
}

export default HendelseFullDag;
