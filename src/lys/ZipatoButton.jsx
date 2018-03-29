import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './style.css';

export default class ZipatoButton extends Component {
  constructor(props) {
    super(props);
    this.firestore = window.firebase.firestore().collection('lysstyring');
  }

  runZipatoScene(sceneId) {
    console.log(`running scene ${sceneId}`);
    this.firestore.doc('kommandoer').set({ type: 'run', scene: sceneId });
  }

  render() {
    return (
      <button className="zipatoButton" onClick={() => this.runZipatoScene(this.props.id)}>
        {this.props.name}
      </button>
    );
  }
}

ZipatoButton.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};
