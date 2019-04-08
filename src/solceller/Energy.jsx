import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TallPanel from './TallPanel';
import EnergyGraph from './EnergyGraph';

class Energy extends React.PureComponent {
  render() {
    return (
      <div>
        <EnergyGraph />
        <TallPanel />
      </div>
    );
  }
}

Energy.defaultProps = {
  usedPower: {},
};

Energy.propTypes = {
  dispatch: PropTypes.func.isRequired,
  current: PropTypes.object.isRequired,
  currentSolar: PropTypes.number.isRequired,
  max: PropTypes.object.isRequired,
  initState: PropTypes.object.isRequired,
  powerPrices: PropTypes.object.isRequired,
  settingSolarMaxDynamic: PropTypes.bool.isRequired,
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

export default connect(mapStateToProps)(Energy);
