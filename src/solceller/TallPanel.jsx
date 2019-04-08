import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TallPanelDisplay from './TallPanelDisplay';

class TallPanel extends React.PureComponent {
  render() {
    return (
      <TallPanelDisplay />
    );
  }
}

TallPanel.propTypes = {
  currentSolar: PropTypes.object.isRequired,
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
