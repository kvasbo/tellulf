import React from 'react';
import TellulfInfoCell from '../TellulfInfoCell';
import './solceller.css';

interface Props {
  currentPower: number;
  netDay: number;
  currentConsumption: number;
  currentSolarProduction: number;
  producedPercent: number;
  accumulatedConsumption: number;
  consumptionMinimum: number;
  consumptionAverage: number;
  consumptionMaximum: number;
  accumulatedProduction: number;
  accumulatedCost: number;
  accumulatedReward: number;
  maxPowerProduction: number;
  localProductionDay: number;
  localProductionMonth: number;
  localProductionYear: number;
  localProductionTotal: number;
  localProductionMaxDay: number;
  localProductionMaxMonth: number;
  localProductionMaxYear: number;
  localProductionMaxTotal: number;
}

class TallPanelDisplay extends React.PureComponent<Props, {}> {
  public static defaultProps = {
    currentPower: 0,
    netDay: 0,
    currentConsumption: 0,
    currentSolarProduction: 0,
    producedPercent: 0,
    accumulatedConsumption: 0,
    consumptionMinimum: 0,
    consumptionAverage: 0,
    consumptionMaximum: 0,
    accumulatedProduction: 0,
    accumulatedCost: 0,
    accumulatedReward: 0,
    maxPowerProduction: 0,
    localProductionDay: 0,
    localProductionMonth: 0,
    localProductionYear: 0,
    localProductionTotal: 0,
    localProductionMaxDay: 0,
    localProductionMaxMonth: 0,
    localProductionMaxYear: 0,
    localProductionMaxTotal: 0,
  };

  // Return either minimum usage or maximum production (one of them is zero!)
  private getMinUsage() {
    if (this.props.maxPowerProduction > 0) {
      return (
        <TellulfInfoCell info={this.props.maxPowerProduction} header="max prod dag" smartRoundKw />
      );
    } else {
      return (
        <TellulfInfoCell info={this.props.consumptionMinimum} header="min bruk" smartRoundKw />
      );
    }
  }

  public render() {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'space-evenly',
        }}
      >
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.netDay}
            unit="kr"
            header="netto dag"
            decimals={2}
            unitSpace
          />
          <TellulfInfoCell
            info={this.props.producedPercent}
            unit="%"
            header="produsert %"
            decimals={2}
          />
          <TellulfInfoCell info={this.props.localProductionMaxDay} header="max dag" smartRoundKw />
        </div>
        <div className="energyTableRow">
          {this.getMinUsage()}
          <TellulfInfoCell info={this.props.consumptionAverage} header="bruk snitt" smartRoundKw />
          <TellulfInfoCell info={this.props.consumptionMaximum} header="bruk max" smartRoundKw />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.accumulatedProduction}
            unit="kWh"
            header="solgt i dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.accumulatedCost}
            unit="kr"
            unitSpace
            header="kost i dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.accumulatedConsumption}
            unit="kWh"
            header="fakturert i dag"
            decimals={2}
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.localProductionDay}
            unit="kWh"
            header="prod dag"
            decimals={1}
          />
          <TellulfInfoCell
            info={this.props.localProductionMonth}
            unit="kWh"
            header="prod måned"
            decimals={0}
          />
          <TellulfInfoCell
            info={this.props.localProductionYear}
            unit="kWh"
            header="prod år"
            decimals={0}
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell info={this.props.localProductionMaxMonth} unit="W" header="max måned" />
          <TellulfInfoCell info={this.props.localProductionMaxYear} unit="W" header="max år" />
          <TellulfInfoCell info={this.props.localProductionMaxTotal} unit="W" header="max totalt" />
        </div>
      </div>
    );
  }
}

export default TallPanelDisplay;
