import React from 'react';
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
    this.updateWeather();
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
      <GraphLong />
    );
  }
}


export default connect()(Yr);
