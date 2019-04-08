import React from 'react';
import PropTypes from 'prop-types';
import './solceller.css';

class TallPanelDisplay extends React.PureComponent {
  render() {
    return (
      <div style={{
        flex: 4.5, display: 'flex', flexDirection: 'column', alignItems: 'space-evenly',
      }}
      >
        <div className="energyTableRow">
          <div className="energyTableBox energyTableBoxLarge">
            <span className="smallStyle">reelt forbruk</span>
            {this.props.currentPower}W
          </div>
          <div className="energyTableBox energyTableBoxLarge">
            <span className="smallStyle">produksjon</span>
            {this.props.currentProduction}W
          </div>
          <div className="energyTableBox energyTableBoxLarge">
            <span className="smallStyle">betalt forbruk</span>
            {this.props.currentConsumption}W
          </div>
          <div className="energyTableBox energyTableBoxLarge">
            <span className="smallStyle">produsert %</span>
            {this.props.producedPercent}%
          </div>
        </div>
        <div className="energyTableRow">
          <div className="energyTableBox">
            <span className="smallStyle">fakturert dag</span>
            {this.props.accumulatedConsumption}kWh
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">bruk min</span>
            {this.props.consumptionMinimum}W
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">bruk snitt</span>
            {this.props.consumptionAverage}W
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">bruk max</span>
            {this.props.consumptionMaximum}W
          </div>
        </div>
        <div className="energyTableRow">
          <div className="energyTableBox">
            <span className="smallStyle">prod dag</span>
            {this.props.localProductionDay}kWh
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">prod måned</span>
            {this.props.localProductionMonth}kWh
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">prod år</span>
            {this.props.localProductionYear}kWh
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">prod totalt</span>
            {this.props.localProductionTotal}kWh
          </div>
        </div>
        <div className="energyTableRow">
          <div className="energyTableBox">
            <span className="smallStyle">max dag</span>
            {this.props.localProductionMaxDay}W
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">max måned</span>
            {this.props.localProductionMaxMonth}W
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">max år</span>
            {this.props.localProductionMaxYear}W
          </div>
          <div className="energyTableBox">
            <span className="smallStyle">max totalt</span>
            {this.props.localProductionMaxTotal}W
          </div>
        </div>
      </div>
    );
  }
}

TallPanelDisplay.propTypes = {
  currentPower: PropTypes.number.isRequired,
  currentProduction: PropTypes.number.isRequired,
  currentConsumption: PropTypes.number.isRequired,
  producedPercent: PropTypes.number.isRequired,
  accumulatedConsumption: PropTypes.number.isRequired,
  consumptionMinimum: PropTypes.number.isRequired,
  consumptionAverage: PropTypes.number.isRequired,
  consumptionMaximum: PropTypes.number.isRequired,
  localProductionDay: PropTypes.string.isRequired,
  localProductionMonth: PropTypes.string.isRequired,
  localProductionYear: PropTypes.string.isRequired,
  localProductionTotal: PropTypes.string.isRequired,
  localProductionMaxDay: PropTypes.number.isRequired,
  localProductionMaxMonth: PropTypes.number.isRequired,
  localProductionMaxYear: PropTypes.number.isRequired,
  localProductionMaxTotal: PropTypes.number.isRequired,
};

export default TallPanelDisplay;
