import React from 'react';
import { connect } from 'react-redux';
import { AppStore } from '../redux/reducers';
import TellulfInfoCell from '../TellulfInfoCell';
import TibberUpdater from '../tibberUpdater';
import { GenericProps } from '../types/generic';
import { InitState } from '../types/initstate';
import { SolarCurrent, SolarMax } from '../types/solar';
import { PowerPriceState, TibberRealtimeState, TibberUsageState } from '../types/tibber';
import TallPanel from './TallPanel';
const defaultLatitude = 59.9508;
const defaultLongitude = 10.6852;

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
  updaters: { tibber: TibberUpdater };
}

class Solceller extends React.PureComponent<Props, GenericProps> {
  private interval = 0;
  public static defaultProps = {
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  };

  public componentDidMount() {
    const { tibber } = this.props.updaters;
    tibber.updatePowerPrices();
    tibber.subscribeToRealTime();
    tibber.updateConsumption();
    tibber.updateConsumptionDaily();
    this.interval = window.setInterval(() => tibber.updateConsumption(), 60 * 1000); // Every minute
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
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginBottom: 20,
          }}
        >
          <div className="energyTableRow">
            <TellulfInfoCell
              info={currentNetConsumptionTotal}
              header="Totalt nå"
              large
              smartRoundKw
              key="currentConsumption"
              unit="W"
            />
          </div>
          <div className="energyTableRow">
            <TellulfInfoCell
              info={currentNetConsumption}
              header="Hus nå"
              large
              smartRoundKw
              key="currentConsumptionHome"
              unit="W"
            />
          </div>
          <div className="energyTableRow">
            <TellulfInfoCell
              info={currentNetConsumptionHytta}
              header="Hytta nå"
              large
              smartRoundKw
              key="currentConsumptionHytta"
              unit="W"
            />
          </div>
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
