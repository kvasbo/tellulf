import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TallPanelDisplay from './TallPanelDisplay';

class TallPanel extends React.PureComponent {
  constructor(props) {
    super(props);
    this.lastProduction = 0;
  }

  render() {
    const currentPower = this.props.realtimePower.power + this.props.currentSolar.now; // Find actual current usage

    // Calculate percentage of usage
    let producedPercent = 0;
    try {
      if (this.props.realtimePower.accumulatedConsumption) {
        // Brukt = laget hjemme + betalt for - solgt
        const spent = this.props.currentSolar.today + (this.props.realtimePower.accumulatedConsumption * 1000) - (this.props.realtimePower.accumulatedProduction * 1000);
        producedPercent = this.props.currentSolar.today / spent * 100;
      }
    } catch (err) {
      console.log(err);
    }

    return (
      <TallPanelDisplay
        currentPower={currentPower}
        currentProduction={this.props.currentSolar.now}
        currentConsumption={this.props.realtimePower.calculatedConsumption}
        producedPercent={producedPercent}
        accumulatedConsumption={this.props.realtimePower.accumulatedConsumption}
        consumptionMinimum={this.props.realtimePower.minPower}
        consumptionMaximum={this.props.realtimePower.maxPower}
        consumptionAverage={this.props.realtimePower.averagePower}
        localProductionDay={this.props.currentSolar.today}
        localProductionMonth={this.props.currentSolar.month}
        localProductionYear={this.props.currentSolar.year}
        localProductionTotal={this.props.currentSolar.total}
        localProductionMaxDay={this.props.max.maxDay}
        localProductionMaxMonth={this.props.max.maxMonth}
        localProductionMaxYear={this.props.max.maxYear}
        localProductionMaxTotal={this.props.max.maxEver}
        accumulatedReward={this.props.realtimePower.accumulatedReward}
        maxPowerProduction={this.props.realtimePower.maxPowerProduction}
        accumulatedCost={this.props.realtimePower.accumulatedCost}
        netDay={this.props.realtimePower.accumulatedCost - this.props.realtimePower.accumulatedReward}
      />
    );
  }
}

TallPanel.propTypes = {
  currentSolar: PropTypes.object.isRequired,
  realtimePower: PropTypes.object.isRequired,
  max: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    currentSolar: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    solarNow: Math.round(state.Solar.current.now / 100) * 100,
    realtimePower: state.TibberRealTime,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(TallPanel);
