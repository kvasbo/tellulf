import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TallPanelDisplay from './TallPanelDisplay';

class TallPanel extends React.PureComponent {
  render() {
    const currentPower = this.props.realtimePower.power + this.props.currentSolar.now; // Find actual current usage
    
    // Todo: Fix percentage
    const producedPercent = (this.props.realtimePower.accumulatedConsumption > 0) ? (this.props.currentSolar.today / 10) / this.props.realtimePower.accumulatedConsumption : 0;

    // Finn nåværende forbruk (eller produksjon!)
    const currentConsumption = (this.props.realtimePower.powerProduction > 0) ? (-1 * this.props.realtimePower.powerProduction) : this.props.realtimePower.power;

    const costDay = Math.round(this.props.realtimePower.accumulatedCost * 100) / 100;

    return (
      <TallPanelDisplay
        currentPower={Math.round(currentPower)}
        currentProduction={Math.round(this.props.currentSolar.now)}
        currentConsumption={Math.round(currentConsumption)}
        producedPercent={Math.round(producedPercent)}
        accumulatedConsumption={Math.round(this.props.realtimePower.accumulatedConsumption * 100) / 100}
        consumptionMinimum={this.props.realtimePower.minPower}
        consumptionMaximum={this.props.realtimePower.maxPower}
        consumptionAverage={this.props.realtimePower.averagePower}
        localProductionDay={getRoundedNumber(Number(this.props.currentSolar.today) / 1000)}
        localProductionMonth={getRoundedNumber(Number(this.props.currentSolar.month) / 1000)}
        localProductionYear={getRoundedNumber(Number(this.props.currentSolar.year) / 1000)}
        localProductionTotal={getRoundedNumber(Number(this.props.currentSolar.total) / 1000)}
        localProductionMaxDay={this.props.max.maxDay}
        localProductionMaxMonth={this.props.max.maxMonth}
        localProductionMaxYear={this.props.max.maxYear}
        localProductionMaxTotal={this.props.max.maxEver}
        accumulatedReward={this.props.realtimePower.accumulatedReward}
        maxPowerProduction={this.props.realtimePower.maxPowerProduction}
        accumulatedCost={costDay}
        netDay={costDay - this.props.realtimePower.accumulatedReward}
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

function getRoundedNumber(number) {
  if (number < 10) {
    return number.toFixed(3);
  } if (number < 100) {
    return number.toFixed(2);
  } if (number < 1000) {
    return number.toFixed(1);
  }
  return number.toFixed(0);
}
