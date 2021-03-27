import React from 'react';
import { connect } from 'react-redux';
import { AppStore } from '../redux/reducers';
import TibberUpdater from '../tibberUpdater';
import { GenericProps } from '../types/generic';
import { InitState } from '../types/initstate';
import { PowerPriceState, TibberRealtimeState, TibberUsageState } from '../types/tibber';
import TallPanel from './TallPanel';
interface Props {
  initState: InitState;
  realtimePowerHjemme: TibberRealtimeState;
  realtimePowerHytta: TibberRealtimeState;
  usedPower: TibberUsageState;
  powerPrices: PowerPriceState;
  updaters: { tibber: TibberUpdater };
}

class Solceller extends React.PureComponent<Props, GenericProps> {
  private interval = 0;

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
    // Regne ut felles verdier.
    const currentNetConsumption = this.props.realtimePowerHjemme.calculatedConsumption; // Find actual current usage

    // Regne ut felles verdier.
    const currentNetConsumptionHytta = this.props.realtimePowerHytta.calculatedConsumption; // Find actual current usage

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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TallPanel
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
    powerPrices: state.PowerPrices,
    initState: state.Init,
    realtimePowerHjemme: state.TibberRealTime.hjemme,
    realtimePowerHytta: state.TibberRealTime.hytta,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
