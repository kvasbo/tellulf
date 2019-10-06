import React from 'react';
import TallPanelDisplay from './TallPanelDisplay';
import { SolarCurrent } from '../types/solar';
import { TibberRealtimeState } from '../types/tibber';

interface Props {
  realtimePower: TibberRealtimeState;
  realtimePowerHytta: TibberRealtimeState;
  currentSolarProduction: SolarCurrent;
  currentNetConsumption: number;
  max: { maxDay: number; maxYear: number; maxMonth: number; maxEver: number };
}

class TallPanel extends React.PureComponent<Props, {}> {
  public render() {
    // Calculate percentage of usage
    let producedPercent = 0;
    try {
      if (this.props.realtimePower.accumulatedConsumption) {
        // Brukt = laget hjemme + betalt for - solgt
        const spent =
          this.props.currentSolarProduction.today +
          this.props.realtimePower.accumulatedConsumption * 1000 -
          this.props.realtimePower.accumulatedProduction * 1000;
        producedPercent = (this.props.currentSolarProduction.today / spent) * 100;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }

    return (
      <TallPanelDisplay
        currentPower={this.props.currentNetConsumption}
        currentConsumption={this.props.realtimePower.calculatedConsumption}
        currentConsumptionHytta={this.props.realtimePowerHytta.calculatedConsumption}
        currentSolarProduction={this.props.currentSolarProduction.now}
        producedPercent={producedPercent}
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
        localProductionDay={this.props.currentSolarProduction.today / 1000}
        localProductionMonth={this.props.currentSolarProduction.month / 1000}
        localProductionYear={this.props.currentSolarProduction.year / 1000}
        localProductionTotal={this.props.currentSolarProduction.total / 1000}
        localProductionMaxDay={this.props.max.maxDay}
        localProductionMaxMonth={this.props.max.maxMonth}
        localProductionMaxYear={this.props.max.maxYear}
        localProductionMaxTotal={this.props.max.maxEver}
        accumulatedReward={this.props.realtimePower.accumulatedReward}
        accumulatedRewardHytta={this.props.realtimePowerHytta.accumulatedReward}
        maxPowerProduction={this.props.realtimePower.maxPowerProduction}
        maxPowerProductionHytta={this.props.realtimePowerHytta.maxPowerProduction}
        accumulatedCost={this.props.realtimePower.accumulatedCost}
        accumulatedCostHytta={this.props.realtimePowerHytta.accumulatedCost}
        netDay={
          this.props.realtimePower.accumulatedCost - this.props.realtimePower.accumulatedReward
        }
        netDayHytta={
          this.props.realtimePowerHytta.accumulatedCost -
          this.props.realtimePowerHytta.accumulatedReward
        }
      />
    );
  }
}

export default TallPanel;
