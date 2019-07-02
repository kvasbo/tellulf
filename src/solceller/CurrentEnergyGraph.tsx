import React from 'react';
import { Style } from '../types/generic';

const calibratedMax = 4500;

interface Props {
  power: number;
  currentProduction: number;
  currentNetConsumption: number;
}

const barCommonStyle: Style = {
  height: '100%',
  alignItems: 'center',
  display: 'flex',
  transition: 'width 1s',
};

const barHolderCommonStyle: Style = {
  ...barCommonStyle,
  width: '50%',
};

class CurrentEnergyGraph extends React.PureComponent<Props, {}> {
  private getData() {
    return [
      {
        name: 'now',
        currentNetConsumption: this.props.currentNetConsumption * -1,
        currentProduction: this.props.currentProduction,
        power: this.props.power,
      },
    ];
  }

  public render() {
    const consumption = Math.round((this.props.currentNetConsumption / calibratedMax) * 100);
    const production = Math.round((this.props.currentProduction / calibratedMax) * 100);
    const power = Math.round((this.props.power / calibratedMax) * 100);
    const consumptionWidth = `${consumption}%`;
    const productionWidth = `${production}%`;
    const netConsumptionWidthPercent = Math.max(0, power) / consumption; // Cause it's percent of the bar, not the whole area!
    const netProductionWidthPercent = Math.max(0, power * -1) / production; // Cause it's percent of the bar, not the whole area!
    const netConsumptionWidth = `${netConsumptionWidthPercent * 100}%`;
    const netProductionWidth = `${netProductionWidthPercent * 100}%`;
    return (
      <div
        style={{
          height: '3vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div
          style={{
            ...barHolderCommonStyle,
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              ...barCommonStyle,
              width: consumptionWidth,
              backgroundColor: '#FF000015',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                ...barCommonStyle,
                width: netConsumptionWidth,
                backgroundColor: '#FF000077',
              }}
            />
          </div>
        </div>
        <div
          style={{
            ...barHolderCommonStyle,
            justifyContent: 'flex-start',
          }}
        >
          <div
            style={{
              ...barCommonStyle,
              width: productionWidth,
              backgroundColor: '#00FF0015',
              justifyContent: 'flex-start',
            }}
          >
            <div
              style={{
                ...barCommonStyle,
                width: netProductionWidth,
                backgroundColor: '#00FF0077',
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default CurrentEnergyGraph;
