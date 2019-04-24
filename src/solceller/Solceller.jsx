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
            currentSolar={this.props.currentSolar}
            powerPrices={this.props.powerPrices}
            max={this.props.max}
            current={this.props.current}
          />
          <TallPanel
            currentSolar={this.props.current}
            max={this.props.max}
            solarNow={this.props.currentSolar}
            realtimePower={this.props.realtimePower}
            userdPower={this.props.usedPower}
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
  current: PropTypes.object.isRequired,
  currentSolar: PropTypes.number.isRequired,
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
    current: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    currentSolar: Math.round(state.Solar.current.now / 100) * 100,
    initState: state.Init,
    settingSolarMaxDynamic: state.Settings.solarMaxDynamic,
    realtimePower: state.TibberRealTime,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
