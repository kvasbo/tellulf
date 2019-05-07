import React from 'react';
import { connect } from 'react-redux';
import TallPanel from './TallPanel';
import EnergyGraph from './EnergyGraph';
import { SolarCurrent } from '../types/solar';
import { AppStore } from '../redux/reducers';
import './solceller.css';

import { InitState } from '../types/initstate';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;
interface Props {
  initState: InitState;
  realtimePower: any;
  currentSolarProduction: SolarCurrent;
  latitude: number;
  longitude: number;
  usedPower: any;
  powerPrices: any;
  max: any;
}

class Solceller extends React.PureComponent<Props, {}> {
  public static defaultProps = {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  };

  public render() {
    if (!this.props.initState.powerPrices || !this.props.initState.solar) return null;

    // Regne ut felles verdier.
    const currentNetConsumption =
      this.props.realtimePower.calculatedConsumption + this.props.currentSolarProduction.now; // Find actual current usage

    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <EnergyGraph
            latitude={this.props.latitude}
            longitude={this.props.longitude}
            usedPower={this.props.usedPower}
            realtimePower={this.props.realtimePower}
            initState={this.props.initState}
            powerPrices={this.props.powerPrices}
            max={this.props.max}
            currentSolarProduction={this.props.currentSolarProduction}
            currentNetConsumption={currentNetConsumption}
          />
          <TallPanel
            currentSolarProduction={this.props.currentSolarProduction}
            max={this.props.max}
            realtimePower={this.props.realtimePower}
            currentNetConsumption={currentNetConsumption}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: AppStore) => {
  return {
    currentSolarProduction: state.Solar.current,
    max: state.Solar.max,
    powerPrices: state.PowerPrices,
    initState: state.Init,
    realtimePower: state.TibberRealTime,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
