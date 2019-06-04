import React from 'react';
import { connect } from 'react-redux';
import TallPanel from './TallPanel';
import TellulfInfoCell from '../TellulfInfoCell';
import EnergyGraph from './EnergyGraph';
import { AppStore } from '../redux/reducers';
import './solceller.css';

import { InitState } from '../types/initstate';
import { PowerPriceState, TibberUsageState, TibberRealtimeState } from '../types/tibber';
import { SolarCurrent, SolarMax } from '../types/solar';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;
interface Props {
  initState: InitState;
  realtimePower: TibberRealtimeState;
  currentSolarProduction: SolarCurrent;
  latitude: number;
  longitude: number;
  usedPower: TibberUsageState;
  powerPrices: PowerPriceState;
  max: SolarMax;
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <TellulfInfoCell
            info={this.props.currentSolarProduction.averageMinute}
            header="Produksjon"
            large
          />
          <TellulfInfoCell info={currentNetConsumption} header="Forbruk" large />
          <TellulfInfoCell
            info={this.props.realtimePower.calculatedConsumption}
            header="Faktureres"
            large
            colorIfNegative="#00FF00"
            absoluteValue
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
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
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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
