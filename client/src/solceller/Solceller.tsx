import React from 'react';
import { connect } from 'react-redux';
import { AppStore } from '../redux/reducers';
import SolarUpdater from '../solarUpdater';
import TellulfInfoCell from '../TellulfInfoCell';
import TibberUpdater from '../tibberUpdater';
import { GenericProps } from '../types/generic';
import { InitState } from '../types/initstate';
import { SolarCurrent, SolarMax } from '../types/solar';
import { PowerPriceState, TibberRealtimeState, TibberUsageState } from '../types/tibber';
import TallPanel from './TallPanel';

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
    tibber.subscribeToRealTime();
    tibber.updateConsumption();
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
            flexDirection: 'column',
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TallPanel
            currentSolarProduction={this.props.currentSolarProduction}
            max={this.props.max}
            realtimePower={this.props.realtimePowerHjemme}
            realtimePowerHytta={this.props.realtimePowerHytta}
            currentNetConsumption={currentNetConsumption}
            powerPrices={this.props.powerPrices}
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
