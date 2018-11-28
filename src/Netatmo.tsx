import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { connect } from 'react-redux';
import { updateNetatmo, updateNetatmoAverages } from './redux/actions';
import firebase from './firebase';

type Props = {
  Netatmo: { updated: number, inneTemp: number, co2: number, inneFukt: number, inneTrykk: number },
  dispatch: Function,
  NetatmoAverages: { time: number, temperature: number, },
  minMax: { min: number, max: number },
}

type State = {
  Netatmo: { updated: number, inneTemp: number, co2: number, inneFukt: number, inneTrykk: number },
  NetatmoAverages: { time: number, temperature: number, },
  Weather: { todayMinMax: { min: number, max: number } },
}

class Netatmo extends React.PureComponent<Props> {

  static defaultProps = { minMax: { max: -9999, min: 9999 } };

  componentDidMount() {
    const dbRef = firebase.database().ref('netatmo/currentData');
    dbRef.on('value', (snapshot) => {
      if(snapshot) {
        const data = snapshot.val();
        this.props.dispatch(updateNetatmo(data));
      }
    });
    const dbRefAvg = firebase.database().ref('netatmo/areaData');
    dbRefAvg.on('value', (snapshot) => {
      if (snapshot) {
        const data = snapshot.val();
        this.props.dispatch(updateNetatmoAverages(data));
      }
    });
  }

  render() {
    // Ikke rendre om ikke data
    if (!this.props.Netatmo.updated || !this.props.NetatmoAverages.time) return null;
    // Finn alder på data
    const avgTime: object = Moment(this.props.NetatmoAverages.time * 1000);
    const ourTime = Moment(this.props.Netatmo.updated);
    const dataAgeAvg = Moment().diff(avgTime, 'minutes');
    const dataAgeOur = Moment().diff(ourTime, 'minutes');
    if (dataAgeAvg + dataAgeOur > 60) {
      return (
        <div>Altfor gamle data</div>
      );
    }

    return (
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div style={{
          display: 'flex', flex: 1, justifyContent: 'space-evenly', alignItems: 'center',
        }}
        >
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 40 }}>{Math.min(this.props.NetatmoAverages.temperature, this.props.minMax.min)}°</span>
          <span style={{ color: 'rgb(255,255,255)', fontSize: 66 }}>{this.props.NetatmoAverages.temperature}°</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 40 }}>{Math.max(this.props.NetatmoAverages.temperature, this.props.minMax.max)}°</span>
        </div>
        <div
          style={{
            flex: 0.4, display: 'flex', justifyContent: 'space-evenly', width: '100%', alignItems: 'center',
          }}
        >
          <div>{this.props.Netatmo.inneTemp}°</div>
          <div>{this.props.Netatmo.co2} ppm</div>
          <div>{Math.round(this.props.Netatmo.inneFukt)}%</div>
          <div>{Math.round(this.props.Netatmo.inneTrykk)} mb</div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: State) {
  return {
    Netatmo: state.Netatmo,
    NetatmoAverages: state.NetatmoAverages,
    minMax: state.Weather.todayMinMax,
  };
}

export default connect(mapStateToProps)(Netatmo);
