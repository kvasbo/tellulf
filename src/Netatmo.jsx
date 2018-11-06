import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateNetatmo, updateNetatmoAverages } from './redux/actions';
import firebase from './firebase';

class Netatmo extends React.PureComponent {
  componentDidMount() {
    const dbRef = firebase.database().ref('netatmo/currentData');
    dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      this.props.dispatch(updateNetatmo(data));
    });
    const dbRefAvg = firebase.database().ref('netatmo/areaData');
    dbRefAvg.on('value', (snapshot) => {
      const data = snapshot.val();
      this.props.dispatch(updateNetatmoAverages(data));
    });
  }

  render() {
    if (!this.props.netatmo || !this.props.averages) return null;
    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', flex: 1, justifyContent: 'space-evenly', alignItems: 'center',
        }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 40 }}>{Math.min(this.props.averages.temperature, this.props.minMax.min)}°</span>
          <span style={{ color: 'rgb(255,255,255)', fontSize: 66 }}>{this.props.averages.temperature}°</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 40 }}>{Math.max(this.props.averages.temperature, this.props.minMax.max)}°</span>
        </div>
        <div
          style={{
            flex: 0.4, display: 'flex', justifyContent: 'space-evenly', width: '100%', alignItems: 'center',
          }}
        >
          <div>{this.props.netatmo.inneTemp}°</div>
          <div>{this.props.netatmo.co2} ppm</div>
          <div>{Math.round(this.props.netatmo.inneFukt)}%</div>
          <div>{Math.round(this.props.netatmo.inneTrykk)} mb</div>
        </div>
      </div>
    );
  }
}

Netatmo.defaultProps = {
  minMax: { max: -9999, min: 9999 },
};

Netatmo.propTypes = {
  netatmo: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  averages: PropTypes.object.isRequired,
  minMax: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    netatmo: state.Netatmo,
    averages: state.NetatmoAverages,
    minMax: state.Weather.todayMinMax,
  };
}

export default connect(mapStateToProps)(Netatmo);
