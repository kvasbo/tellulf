import React from 'react';
import { connect } from 'react-redux';
import { AppStore } from '../redux/reducers';
import { GenericProps } from '../types/generic';
import { PowerPriceState, TibberRealtimeState, TibberUsageState } from '../types/tibber';
import TallPanel from './TallPanel';
interface Props {
  realtimePowerHjemme: TibberRealtimeState;
  realtimePowerHytta: TibberRealtimeState;
  usedPower: TibberUsageState;
  powerPrices: PowerPriceState;
}

class Solceller extends React.PureComponent<Props, GenericProps> {
  private interval = 0;

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
    realtimePowerHjemme: state.TibberRealTime.hjemme,
    realtimePowerHytta: state.TibberRealTime.hytta,
    usedPower: state.TibberLastDay,
  };
};

export default connect(mapStateToProps)(Solceller);
