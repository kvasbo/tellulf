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
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gridTemplateRows: 'auto auto auto' }}>
        <div>{this.props.averages.temperature}°</div>
        <div>{this.props.netatmo.inneTemp}°</div>
        <div>{this.props.netatmo.co2} ppm</div>
        <div>{Math.round(this.props.netatmo.inneFukt)}%</div>
        <div>{Math.round(this.props.netatmo.inneTrykk)} mb</div>
      </div>
      /*<View style={{ flex: 0.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' , backgroundColor: '#000000'}} >
        <View style={{ flex: 0.5, padding: 10, alignItems: 'flex-end', backgroundColor: '#000000', justifyContent: 'center' }} >
          <Text style={{ color: '#FFFFFF', fontSize: 75, fontWeight: '200' }}>{this.props.averages.temperature}°</Text>
        </View>
        <View style={{ flex: 0.7, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }} >
          <View style={{ paddingLeft: 10, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }} >
            <Text style={{ color: '#FFFFFF', padding: 3, fontSize: 20, fontWeight: '200' }}>{this.props.netatmo.inneTemp}°</Text>
            <Text style={{ color: '#FFFFFF', padding: 3, fontSize: 20, fontWeight: '200' }}>{this.props.netatmo.co2} ppm</Text>
          </View>
          <View style={{ paddingLeft: 10, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }} >
            <Text style={{ color: '#FFFFFF', padding: 3, fontSize: 20, fontWeight: '200' }}>{Math.round(this.props.netatmo.inneFukt)}%</Text>
            <Text style={{ color: '#FFFFFF', padding: 3, fontSize: 20, fontWeight: '200' }}>{Math.round(this.props.netatmo.inneTrykk)} mb</Text>
          </View>
        </View>
      </View>*/
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
