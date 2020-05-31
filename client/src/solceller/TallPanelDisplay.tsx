import React from 'react';
import TellulfInfoCell from '../TellulfInfoCell';
import './solceller.css';

interface Props {
  currentPower: number;
  netDay: number;
  netDayHytta: number;
  currentConsumption: number;
  currentConsumptionHytta: number;
  currentSolarProduction: number;
  producedPercent: number;
  accumulatedConsumption: number;
  accumulatedConsumptionHytta: number;
  consumptionMinimum: number;
  consumptionAverage: number;
  consumptionMaximum: number;
  consumptionMinimumHytta: number;
  consumptionAverageHytta: number;
  consumptionMaximumHytta: number;
  accumulatedProduction: number;
  accumulatedProductionHytta: number;
  accumulatedCost: number;
  accumulatedReward: number;
  accumulatedCostHytta: number;
  accumulatedRewardHytta: number;
  maxPowerProduction: number;
  maxPowerProductionHytta: number;
  localProductionDay: number;
  localProductionMonth: number;
  localProductionYear: number;
  localProductionTotal: number;
  localProductionMaxDay: number;
  localProductionMaxMonth: number;
  localProductionMaxYear: number;
  localProductionMaxTotal: number;
}

class TallPanelDisplay extends React.PureComponent<Props, Record<string, unknown>> {
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
  private getMinUsage(hytta: boolean) {
    const prodMax = !hytta ? this.props.maxPowerProduction : this.props.maxPowerProductionHytta;
    const useMin = !hytta ? this.props.consumptionMinimum : this.props.consumptionMinimumHytta;
    if (prodMax > 0) {
      return (
        <TellulfInfoCell key="maxProd" info={prodMax} header="max prod" smartRoundKw unit="W" />
      );
    } else {
      return (
        <TellulfInfoCell key="maxProd" info={useMin} header="min bruk" smartRoundKw unit="W" />
      );
    }
  }

  public render(): React.ReactNode {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'space-evenly',
        }}
      >
        <div className="energyTableRow">Hjemme</div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.netDay}
            unit="kr"
            header="netto dag"
            decimals={2}
            unitSpace
            key="netDay"
          />
          <TellulfInfoCell
            info={this.props.accumulatedConsumption}
            unit="kWh"
            header="forbruk i dag"
            key="paidDay"
            decimals={1}
          />
          <TellulfInfoCell
            info={this.props.accumulatedProduction}
            unit="kWh"
            header="solgt i dag"
            key="soldDay"
            decimals={1}
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.producedPercent}
            unit="%"
            header="produsert %"
            decimals={1}
            key="prodPercent"
          />
          {this.getMinUsage(false)}
          <TellulfInfoCell
            info={this.props.consumptionMaximum}
            header="max bruk"
            key="maxBruk"
            smartRoundKw
            unit="W"
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.localProductionDay}
            unit="kWh"
            header="prod dag"
            decimals={1}
            key="prodDay"
          />
          <TellulfInfoCell
            info={this.props.localProductionMonth}
            unit="kWh"
            header="prod måned"
            decimals={0}
            key="prodMonth"
          />
          <TellulfInfoCell
            info={this.props.localProductionYear / 1000}
            unit="MWh"
            header="prod år"
            decimals={1}
            key="prodYear"
          />
        </div>
        <div className="energyTableRow">Hytta</div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.netDayHytta}
            unit="kr"
            header="netto dag"
            decimals={1}
            key="cabinMoney"
          />
          <TellulfInfoCell
            info={this.props.accumulatedConsumptionHytta}
            unit="kWh"
            header="forbruk i dag"
            decimals={1}
            key="cabinUsed"
          />
          <TellulfInfoCell
            info={this.props.accumulatedProductionHytta}
            unit="kWh"
            header="solgt i dag"
            decimals={1}
            key="cabinMade"
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.currentConsumptionHytta}
            unit="W"
            header="forbruk nå"
            decimals={0}
            key="cabinCurrent"
          />
          {this.getMinUsage(true)}
          <TellulfInfoCell
            info={this.props.consumptionMaximumHytta}
            unit="W"
            header="max bruk"
            decimals={1}
            smartRoundKw
            key="cabinMaxUse"
          />
        </div>
      </div>
    );
  }
}

export default TallPanelDisplay;
