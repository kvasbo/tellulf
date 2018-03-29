import React, { Component } from 'react';
import ZipatoButton from './ZipatoButton';

import './style.css';

export default class ZipatoPanel extends Component {
  constructor(props) {
    super(props);
    this.state = { scenes: [] };
  }

  componentWillMount() {
    const firestore = window.firebase.firestore().collection('lysstyring').doc('scener');

    firestore.onSnapshot((docSnapshot) => {
      const scenes = docSnapshot.data();

      const out = [];
      scenes.data.forEach((scene) => {
        out.push({ id: scene.uuid, name: scene.name });
      });

      this.setState({ scenes: out });
    });
  }

  getButtons() {
    const buttons = [];
    for (let i = 0; i < this.state.scenes.length; i += 1) {
      buttons.push(<ZipatoButton key={this.state.scenes[i].id} id={this.state.scenes[i].id} name={this.state.scenes[i].name} />);
    }
    return buttons;
  }

  render() {
    return (
      <div id="reactZipatoRoot">
        {this.getButtons()}
      </div>
    );
  }
}
