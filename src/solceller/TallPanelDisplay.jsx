import React from 'react';
import PropTypes from 'prop-types';
import TellulfInfoCell from '../TellulfInfoCell';
import './solceller.css';

class TallPanelDisplay extends React.PureComponent {
  render() {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'space-evenly',
      }}
      >
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.currentPower}
            unit="W"
            header="reelt forbruk"
            large
          />
          <TellulfInfoCell
            info={this.props.currentProduction}
            unit="W"
            header="produksjon"
            large
          />
          <TellulfInfoCell
            info={this.props.currentConsumption}
            unit="W"
            header="betalt forbruk"
            large
          />
          <TellulfInfoCell
            info={this.props.producedPercent}
            unit="%"
            header="produsert %"
            large
            decimals={2}
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.accumulatedConsumption}
            unit="kWh"
            header="bruk i dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.consumptionMinimum}
            unit="kWh"
            header="bruk min"
          />
          <TellulfInfoCell
            info={this.props.consumptionAverage}
            unit="W"
            header="bruk snitt"
          />
          <TellulfInfoCell
            info={this.props.consumptionMaximum}
            unit="W"
            header="bruk max"
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.accumulatedCost}
            unit=" kr"
            header="kost dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.accumulatedReward}
            unit=" kr"
            header="fortjeneste dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.netDay}
            unit=" kr"
            header="netto dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.maxPowerProduction}
            unit="W"
            header="max produksjon dag"
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.localProductionDay}
            unit="kWh"
            header="prod dag"
            decimals={2}
          />
          <TellulfInfoCell
            info={this.props.localProductionMonth}
            unit="kWh"
            header="prod måned"
            decimals={1}
          />
          <TellulfInfoCell
            info={this.props.localProductionYear}
            unit="kWh"
            header="prod år"
            decimals={1}
          />
          <TellulfInfoCell
            info={this.props.localProductionTotal}
            unit="kWh"
            header="prod totalt"
          />
        </div>
        <div className="energyTableRow">
          <TellulfInfoCell
            info={this.props.localProductionMaxDay}
            unit="kWh"
            header="max dag"
          />
          <TellulfInfoCell
            info={this.props.localProductionMaxMonth}
            unit="kWh"
            header="max måned"
          />
          <TellulfInfoCell
            info={this.props.localProductionMaxYear}
            unit="kWh"
            header="max år"
          />
          <TellulfInfoCell
            info={this.props.localProductionMaxTotal}
            unit="kWh"
            header="max totalt"
          />
        </div>
      </div>
    );
  }
}

TallPanelDisplay.defaultProps = {
  currentPower: undefined,
  currentProduction: undefined,
  currentConsumption: undefined,
  producedPercent: undefined,
  accumulatedConsumption: undefined,
  consumptionMinimum: undefined,
  consumptionAverage: undefined,
  consumptionMaximum: undefined,
  localProductionDay: undefined,
  localProductionMonth: undefined,
  localProductionYear: undefined,
  localProductionTotal: undefined,
  localProductionMaxDay: undefined,
  localProductionMaxMonth: undefined,
  localProductionMaxYear: undefined,
  localProductionMaxTotal: undefined,
  accumulatedReward: undefined,
  maxPowerProduction: undefined,
  accumulatedCost: undefined,
  netDay: undefined,
};

TallPanelDisplay.propTypes = {
  currentPower: PropTypes.number,
  currentProduction: PropTypes.number,
  currentConsumption: PropTypes.number,
  producedPercent: PropTypes.number,
  accumulatedConsumption: PropTypes.number,
  consumptionMinimum: PropTypes.number,
  consumptionAverage: PropTypes.number,
  consumptionMaximum: PropTypes.number,
  localProductionDay: PropTypes.number,
  localProductionMonth: PropTypes.number,
  localProductionYear: PropTypes.number,
  localProductionTotal: PropTypes.number,
  localProductionMaxDay: PropTypes.number,
  localProductionMaxMonth: PropTypes.number,
  localProductionMaxYear: PropTypes.number,
  localProductionMaxTotal: PropTypes.number,
  accumulatedReward: PropTypes.number,
  maxPowerProduction: PropTypes.number,
  accumulatedCost: PropTypes.number,
  netDay: PropTypes.number,
};

export default TallPanelDisplay;
