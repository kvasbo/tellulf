import React, { Component } from 'react';
import PropTypes from 'prop-types';
import AnimatedNumber from 'react-animated-number';

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
    if (this.props.animated) {
      return (
        <AnimatedNumber duration={1500} stepPrecision={0} value={this.props.mainItem} />
      );
    }
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
  unit: '',
  animated: false,
};

MainListItemFour.propTypes = {
  mainItem: PropTypes.string.isRequired,
  subItems: PropTypes.array,
  unit: PropTypes.string,
  animated: PropTypes.bool,
};
