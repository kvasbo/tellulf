import React, { Component } from 'react';

export default class MainListItem extends Component {
  getSubItems() {
    const c = (this.props.subItems.length > 2) ? 'listBlockText' : 'listBlockTextLarge';
    return this.props.subItems.map(item => (<div key={Math.random()} className={c}>{item}</div>));
  }

  getUnit() {
    if (!this.props.unit) return null;

    return (
      <span className="unit">{this.props.unit}</span>
    );
  }

  render() {
    return (
      <div className="listBlock">
        <div className="listBlockMainArea">{this.props.mainItem}{this.getUnit()}</div>
        <div className="listBlockSubArea">
          {this.getSubItems()}
        </div>
      </div>
    );
  }
}
