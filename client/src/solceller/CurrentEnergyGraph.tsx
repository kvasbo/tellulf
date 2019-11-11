import React from 'react';
import EnergyGauge from '../gauges/EnergyGauge';

const calibratedMax = 5000;

interface Props {
  currentNetConsumption: number;
  currentNetConsumptionHytta: number;
}

class CurrentEnergyGraph extends React.PureComponent<Props, {}> {
  public render() {
    return (
      <div
        style={{
          height: '80px',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <EnergyGauge
          key="Hjemmenå"
          value={this.props.currentNetConsumption}
          max={calibratedMax}
          title="Hjemme"
        />
        <EnergyGauge
          key="HyttaNå"
          value={this.props.currentNetConsumptionHytta}
          max={calibratedMax}
          title="Hytta"
        />
      </div>
    );
  }
}

export default CurrentEnergyGraph;
