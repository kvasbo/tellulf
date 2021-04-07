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
  }

  public componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  public render() {
    // Regne ut felles verdier.
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
            currentNetConsumption={this.props.realtimePowerHjemme.calculatedConsumption}
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
