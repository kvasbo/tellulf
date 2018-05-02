import React, { Component } from 'react';
import Moment from 'moment';
import Klokke from './klokke/Klokke';
import Netatmo from './netatmo/Netatmo';
import Kalender from './kalender/Kalender';
import Preggo from './preggo/Preggo';
import Ruter from './ruter/Ruter';
import Solceller from './solceller/Solceller';
import Yr from './weather/Yr';
import ZipatoPanel from './lys/Zipato';
import Modal from './components/Modal';
import './cssReset.css';
import './tellulf.css';

function startReloadLoop() {
  const now = new Moment();
  const reload = now.clone().startOf('day').add(1, 'day').add(1, 'minutes');
  const diff = reload.diff(now, 'milliseconds');
  // console.log('Reload at', reload.format('YYYY-MM-DD HH:mm'));
  window.reloadTimer = setTimeout(() => {
    window.location.reload();
  }, diff);
}

class Tellulf extends Component {
  constructor(props) {
    super(props);
    this.state = { modal: 'none' };
    this.killModal = this.killModal.bind(this);
  }

  componentDidMount() {
    startReloadLoop();
  }

  getModal() {
    if (this.state.modal === 'zipato') return (<Modal close={this.killModal}><ZipatoPanel /></Modal>);
    return null;
  }

  killModal() {
    this.setState({ modal: 'none' });
  }

  render() {
    return (
      <div className="App" id="mainContainer">
        <div id="contentArea">
          <div id="leftContainer">
            <div id="container_klokke" className="block">
              <Klokke />
            </div>
            <div id="container_netatmo" className="block">
              <Netatmo />
            </div>
            <div id="container_solceller" className="block">
              <Solceller />
            </div>
            <div id="container_yr" className="block">
              <Yr />
            </div>
          </div>
          <div id="rightContainer">
            <div id="container_kalender" className="block">
              <Kalender />
            </div>
          </div>
        </div>
        <div id="bottomContainer">
          <div id="container_flatBane" className="block">
            <Ruter stasjon="3012315" retning="1 (Retning sentrum)" />
          </div>
        </div>
      </div>
    );
  }
}

/**
       <div id="buttonsContainer">
          <i className="material-icons button" onClick={() => { this.setState({ modal: 'zipato' }); }}>lightbulb_outline</i>
        </div>
        {this.getModal()}
 */

export default Tellulf;
