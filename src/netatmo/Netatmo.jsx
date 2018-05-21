import React, { Component } from 'react';
import Moment from 'moment';
import { connect } from 'react-redux';
import { updateNetatmo } from '../redux/actions';

class Netatmo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      temp: null,
      co2: null,
      inneTemp: null,
      fukt: null,
      trykk: null,
    };
  }

  componentDidMount() {
    console.log('Netatmo mounted');
    const dbRef = window.firebase.database().ref('netatmo/currentData');

    dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      const updated = Moment(data.updated);
      const diff = Moment().diff(updated, 'minutes');

      // console.log('netatmo', data);
    
      this.props.dispatch(updateNetatmo(data));

      if (diff < 60) {
        try {
          const temp = (typeof data.uteTemp !== 'undefined') ? data.uteTemp.toFixed(1) : null;
          const inneTemp = (typeof data.inneTemp !== 'undefined') ? Math.round(data.inneTemp) : null;
          const co2 = (typeof data.co2 !== 'undefined') ? Math.round(data.co2) : null;
          const fukt = (typeof data.inneFukt !== 'undefined') ? Math.round(data.inneFukt) : null;
          const trykk = (typeof data.inneTrykk !== 'undefined') ? Math.round(data.inneTrykk) : null;
  
          this.setState({
            temp, inneTemp, co2, fukt, updated, trykk,
          });
        } catch (err) {
          console.log(err);
        }
      } else {
        this.setState({
          temp: null, inneTemp: null, co2: null, fukt: null, updated: null, trykk: null,
        });
      }
    });
  }

  render() {
    const now = new Date();
    const ageInMinutes = (now - this.state.updated) / 60 / 1000;

    let nowTemp = this.state.temp;

    if (ageInMinutes > 60) {
      nowTemp = '?';
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '45% 14% 25% auto', gridColumnGap: 30, gridTemplateRows: '10% 40% 40% 10%', height: '100%', width: '100%' }} >
        <div style={{ gridColumnStart: 1, gridColumnEnd: 2, gridRowStart: 2, gridRowEnd: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: '9vh' }} >
          {nowTemp}
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3, gridRowStart: 2, gridRowEnd: 3, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '15pt' }} >
          {this.state.inneTemp}°
        </div>
        <div style={{ gridColumnStart: 2, gridColumnEnd: 3, gridRowStart: 3, gridRowEnd: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '15pt', }} >
          {this.state.co2} ppm
        </div>
        <div style={{ gridColumnStart: 3, gridColumnEnd: 4, gridRowStart: 2, gridRowEnd: 3, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '15pt' }} >
          {this.state.fukt}%
        </div>
        <div style={{ gridColumnStart: 3, gridColumnEnd: 4, gridRowStart: 3, gridRowEnd: 4, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '15pt' }} >
          {this.state.trykk} mb
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    netatmo: state.Netatmo,
  };
}

export default connect(mapStateToProps)(Netatmo);