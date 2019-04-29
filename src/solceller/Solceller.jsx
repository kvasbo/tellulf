import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TallPanel from './TallPanel';
import EnergyGraph from './EnergyGraph';
import './solceller.css';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;

class Solceller extends React.PureComponent {
  constructor(props) {
    super(props);
    this.reloadTimer = null;
  }

  render() {
    if (!this.props.initState.powerPrices || !this.props.initState.solar) return null;

    // Regne ut felles verdier.
    const currentNetConsumption = this.props.realtimePower.calculatedConsumption + this.props.currentSolarProduction.now; // Find actual current usage

    return (
      <div style={{
        display: 'flex', flex: 1, flexDirection: 'column', height: '100%',
      }}
      >
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <EnergyGraph
            latitude={this.props.latitude}
            longitude={this.props.longitude}
            usedPower={this.props.usedPower}
            realtimePower={this.props.realtimePower}
            initState={this.props.initState}
            powerPrices={this.props.powerPrices}
            max={this.props.max}
            currentSolarProduction={this.props.currentSolarProduction}
            currentNetConsumption={currentNetConsumption}
          />
          <TallPanel
            currentSolarProduction={this.props.currentSolarProduction}
            max={this.props.max}
            realtimePower={this.props.realtimePower}
            currentNetConsumption={currentNetConsumption}
          />
        </div>
      </div>
    );
  }
}

Solceller.defaultProps = {
  latitude: defaultLatitude,
  longitude: defaultLongitude,
  usedPower: {},
};

Solceller.propTypes = {
  currentSolarProduction: PropTypes.object.isRequired,
  max: PropTypes.object.isRequired,
  initState: PropTypes.object.isRequired,
  powerPrices: PropTypes.object.isRequired,
  latitude: PropTypes.number,
  longitude: PropTypes.number,
  realtimePower: PropTypes.object.isRequired,
  usedPower: PropTypes.object,
};

const mapStateToProps = (state) => {
  return {
    currentSolarProduction: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    initState: state.Init,
    settingSolarMaxDynamic: state.Settings.solarMaxDynamic,
    realtimePower: state.TibberRealTime,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
