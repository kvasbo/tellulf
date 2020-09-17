import React from 'react';
import { connect } from 'react-redux';
import TallPanel from './TallPanel';
import TellulfInfoCell from '../TellulfInfoCell';
import EnergyGraph from './EnergyGraph';
import MaxEnergyGraph from './MaxEnergyGraph';
import { AppStore } from '../redux/reducers';
import TibberUpdater from '../tibberUpdater';
import SolarUpdater from '../solarUpdater';
import { InitState } from '../types/initstate';
import { GenericProps } from '../types/generic';

import { PowerPriceState, TibberUsageState, TibberRealtimeState } from '../types/tibber';
import { SolarCurrent, SolarMax } from '../types/solar';

const defaultLatitude = 59.9409;
const defaultLongitude = 10.6991;
interface Props {
  initState: InitState;
  realtimePowerHjemme: TibberRealtimeState;
  realtimePowerHytta: TibberRealtimeState;
  currentSolarProduction: SolarCurrent;
  latitude: number;
  longitude: number;
  usedPower: TibberUsageState;
  powerPrices: PowerPriceState;
  max: SolarMax;
  updaters: { tibber: TibberUpdater; solar: SolarUpdater };
}

class Solceller extends React.PureComponent<Props, GenericProps> {
  private interval = 0;
  public static defaultProps = {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  };

  public componentDidMount() {
    const { tibber, solar } = this.props.updaters;
    tibber.updatePowerPrices();
    tibber.subscribeToRealTime('2b05f8c5-3241-465d-92b8-9e7ad567f78f', 'hjemme');
    tibber.subscribeToRealTime('61f93ce4-f15c-49c2-aac1-9d9f0e1d76bb', 'hytta');
    tibber.updateConsumption();
    // tibber.updateConsumptionMonthlyAndCalculateBills();
    tibber.updateConsumptionDaily();
    this.interval = window.setInterval(() => tibber.updateConsumption(), 60 * 1000); // Every minute
    solar.attachListeners();
    solar.attachMaxListeners();
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  public render() {
    if (!this.props.initState.solar) return null;

    // Regne ut felles verdier.
    const currentNetConsumption = this.props.realtimePowerHjemme.calculatedConsumption; // Find actual current usage

    // Regne ut felles verdier.
    const currentNetConsumptionHytta = this.props.realtimePowerHytta.calculatedConsumption; // Find actual current usage

    const currentNetConsumptionTotal = currentNetConsumption + currentNetConsumptionHytta;

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
            info={currentNetConsumptionTotal}
            header="Totalt nå"
            large
            smartRoundKw
            key="currentConsumption"
            unit="W"
          />
          <TellulfInfoCell
            info={currentNetConsumption}
            header="Hus nå"
            large
            smartRoundKw
            key="currentConsumptionHome"
            unit="W"
          />
          <TellulfInfoCell
            info={currentNetConsumptionHytta}
            header="Hytta nå"
            large
            smartRoundKw
            key="currentConsumptionHytta"
            unit="W"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <EnergyGraph
            latitude={this.props.latitude}
            longitude={this.props.longitude}
            usedPower={this.props.usedPower}
            realtimePower={this.props.realtimePowerHjemme}
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
            realtimePower={this.props.realtimePowerHjemme}
            realtimePowerHytta={this.props.realtimePowerHytta}
            currentNetConsumption={currentNetConsumption}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MaxEnergyGraph
            day={this.props.max.maxDay}
            year={this.props.max.maxYear}
            month={this.props.max.maxMonth}
            ever={this.props.max.maxEver}
            currentProduction={this.props.currentSolarProduction.now}
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
    realtimePowerHjemme: state.TibberRealTime.hjemme,
    realtimePowerHytta: state.TibberRealTime.hytta,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
