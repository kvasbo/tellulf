import React, { Component } from 'react';

export default class Modal extends Component {
  render() {
    return (
      <div className="modal">
        <div>
          <i className="material-icons button" onClick={() => this.props.close()}>close</i>
        </div>
        <div className="modalContent">
          {this.props.children}
        </div>
      </div>
    );
  }
}
