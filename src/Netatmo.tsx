import React from 'react';
import { netatmoStore } from './redux/Netatmo';
import Moment from 'moment';
import { connect } from 'react-redux';
import { updateNetatmo, updateNetatmoAverages } from './redux/actions';
import firebase from './firebase';
import TellulfInfoCell from './TellulfInfoCell';

type Props = {
  Netatmo: netatmoStore,
  dispatch: Function,
  NetatmoAverages: { time: number, temperature: number, },
  minMax: { min: number, max: number },
}

type State = {
  Netatmo: netatmoStore,
  NetatmoAverages: { time: number, temperature: number, },
  Weather: { todayMinMax: { min: number, max: number } },
}

class Netatmo extends React.PureComponent<Props> {

  static defaultProps = { minMax: { max: -9999, min: 9999 } };

  componentDidMount() {
    const dbRef = firebase.database().ref('netatmo/currentData');
    dbRef.on('value', (snapshot) => {
      if(snapshot) {
        const data: netatmoStore = snapshot.val() as netatmoStore;
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
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column', justifyContent: 'space-evenly' }}>
        <div style={{
          display: 'flex', flex: 1, justifyContent: 'space-evenly', alignItems: 'center', margin: 0
        }}
        >
          <TellulfInfoCell info={Math.min(this.props.NetatmoAverages.temperature, this.props.minMax.min)} unit='°' fontSize={30} color="rgba(255,255,255,0.45)" header="min" />
          <TellulfInfoCell info={this.props.NetatmoAverages.temperature} unit='°' decimals={1} fontSize={60} />
          <TellulfInfoCell info={Math.max(this.props.NetatmoAverages.temperature, this.props.minMax.max)} unit='°' fontSize={30} color="rgba(255,255,255,0.45)" header="max" />
        </div>
        <div
          style={{
            flex: 0.8, display: 'flex', justifyContent: 'space-evenly', width: '100%', alignItems: 'center', margin: 0
          }}
        >
          <TellulfInfoCell info={Number(this.props.Netatmo.inneTemp)} decimals={1} unit='°' header="inne" />
          <TellulfInfoCell info={Number(this.props.Netatmo.co2)} decimals={1} unit='ppm' header="co2" />
          <TellulfInfoCell info={Number(this.props.Netatmo.inneFukt)} decimals={1} unit='%' header="fukt" />
          <TellulfInfoCell info={Number(this.props.Netatmo.inneTrykk)} decimals={1} unit='°' header="trykk" />
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
