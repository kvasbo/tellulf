import React from 'react';
import { GenericProps } from '../types/generic';
import { PowerPriceState, TibberRealtimeState } from '../types/tibber';
import TallPanelDisplay from './TallPanelDisplay';

interface Props {
  realtimePower: TibberRealtimeState;
  realtimePowerHytta: TibberRealtimeState;
  currentNetConsumption: number;
  powerPrices: PowerPriceState;
}

class TallPanel extends React.PureComponent<Props, GenericProps> {
  public render(): React.ReactNode {
    // Get current power price
    const hour = new Date().getHours();
    const powerPrice = this.props.powerPrices[hour] ? this.props.powerPrices[hour].total : 0;

    return (
      <TallPanelDisplay
        currentPower={this.props.currentNetConsumption}
        currentConsumption={this.props.realtimePower.calculatedConsumption}
        currentConsumptionHytta={this.props.realtimePowerHytta.calculatedConsumption}
        accumulatedConsumption={this.props.realtimePower.accumulatedConsumption}
        accumulatedConsumptionHytta={this.props.realtimePowerHytta.accumulatedConsumption}
        accumulatedProduction={this.props.realtimePower.accumulatedProduction}
        accumulatedProductionHytta={this.props.realtimePowerHytta.accumulatedProduction}
        consumptionMinimum={this.props.realtimePower.minPower}
        consumptionMaximum={this.props.realtimePower.maxPower}
        consumptionAverage={this.props.realtimePower.averagePower}
        consumptionMinimumHytta={this.props.realtimePowerHytta.minPower}
        consumptionMaximumHytta={this.props.realtimePowerHytta.maxPower}
        consumptionAverageHytta={this.props.realtimePowerHytta.averagePower}
        accumulatedReward={this.props.realtimePower.accumulatedReward}
        accumulatedRewardHytta={this.props.realtimePowerHytta.accumulatedReward}
        maxPowerProduction={this.props.realtimePower.maxPowerProduction}
        maxPowerProductionHytta={this.props.realtimePowerHytta.maxPowerProduction}
        accumulatedCost={this.props.realtimePower.accumulatedCost}
        accumulatedCostHytta={this.props.realtimePowerHytta.accumulatedCost}
        netDay={this.props.realtimePower.actualCost}
        netDayHytta={this.props.realtimePowerHytta.actualCost}
        costPerKwh={powerPrice}
      />
    );
  }
}

export default TallPanel;
