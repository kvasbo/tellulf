import React from 'react';
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
      <div style={{ display: 'flex', height: '100%', flexDirection: 'row' }}>
        <div style={{ display: 'flex', flex: 1, padding: 20, justifyContent: 'flex-end', alignItems: 'center', fontSize: 75 }}>
          {this.props.averages.temperature}°
        </div>
        <div style={{ flex: 1, paddingLeft: 20, display: 'grid', gridTemplateColumns: 'auto auto', gridTemplateRows: 'auto auto', justifyItems: 'start', alignItems: 'center' }}>
          
          <div>{this.props.netatmo.inneTemp}°</div>
          <div>{this.props.netatmo.co2} ppm</div>
          <div>{Math.round(this.props.netatmo.inneFukt)}%</div>
          <div>{Math.round(this.props.netatmo.inneTrykk)} mb</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    netatmo: state.Netatmo,
    averages: state.NetatmoAverages,
  };
}

export default connect(mapStateToProps)(Netatmo);
