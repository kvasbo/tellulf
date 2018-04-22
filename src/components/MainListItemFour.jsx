import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class MainListItemFour extends Component {
  getSubItems() {
    return this.props.subItems.map((item) => {
      return (
        <div
          key={Math.random()}
          style={{
            width: '50%',
            display: 'flex',
            fontSize: '15pt',
            overflow: 'hidden',
            height: '33%',
            alignItems: 'center',
          }}
        >{item}
        </div>
      );
    });
  }

  getUnit() {
    if (!this.props.unit) return null;

    return (
      <span className="unit">{this.props.unit}</span>
    );
  }

  getMainItem() {
    return this.props.mainItem;
  }

  render() {
    return (
      <div className="listBlock">
        <div className="listBlockMainArea">{this.getMainItem()}{this.getUnit()}</div>
        <div style={{
          display: 'flex',
          flex: 1,
          width: '90%',
          paddingTop: 20,
          paddingBottom: 20,
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
        >
          {this.getSubItems()}
        </div>
      </div>
    );
  }
}

MainListItemFour.defaultProps = {
  subItems: [],
  mainItem: '',
  unit: '',
  animated: false,
};

MainListItemFour.propTypes = {
  mainItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  unit: PropTypes.string,
  animated: PropTypes.bool,
};
