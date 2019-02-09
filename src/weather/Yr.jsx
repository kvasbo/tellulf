import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchWeather } from '../redux/actions.ts';
import GraphLong from './GraphLong';
import './yr.css';

const steder = {
  oslo: { lat: 59.9409, long: 10.6991 },
  sandefjord: { lat: 59.1347624, long: 10.3250789 },
};

class Yr extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { sted: 'oslo' };
  }

  componentDidMount() {
    setTimeout(() => { this.updateWeather(); }, 1500);
  }

  updateWeather() {
    const { lat, long } = steder[this.state.sted];
    this.props.dispatch(fetchWeather(lat, long));
  }

  stedEndra(e) {
    this.setState({ sted: e.currentTarget.value });
    const { lat, long } = steder[e.currentTarget.value];
    this.props.dispatch(fetchWeather(lat, long));
  }

  // Stays on
  render() {
    return (
      <div className="yr-container">
        <GraphLong />
        <div style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 0,
        }}
        >
          <label htmlFor="oslo">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="oslo"
              name="sted"
              value="oslo"
              checked={this.state.sted === 'oslo'}
              onChange={val => this.stedEndra(val)}
            />
            Hjemme
          </label>
          <label htmlFor="sandefjord">
            <input
              style={{ margin: 10 }}
              type="radio"
              id="sandefjord"
              name="sted"
              value="sandefjord"
              checked={this.state.sted === 'sandefjord'}
              onChange={val => this.stedEndra(val)}
            />
            Hytta
          </label>
        </div>
      </div>
    );
  }
}

Yr.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Yr);
