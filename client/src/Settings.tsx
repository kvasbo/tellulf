import * as React from 'react';
import firebase from './firebase';
import store from 'store';
import { GenericProps } from './types/generic';

class Settings extends React.PureComponent<GenericProps, GenericProps> {
  setBool = (key: string, value: boolean): void => {
    store.set(key, value);
    window.location.reload();
  };

  private async signOut() {
    await firebase.auth().signOut();
    window.location.reload();
  }

  public render(): React.ReactNode {
    const showEnergy = store.get('showEnergy', true);
    const showTrains = store.get('showTrains', true);
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        <div>
          <label htmlFor="showEnergy">Show Energy</label>
          <input
            type="checkbox"
            checked={showEnergy}
            id="showEnergy"
            onChange={() => this.setBool('showEnergy', !showEnergy)}
          ></input>
        </div>
        <div>
          <label htmlFor="showTrains">Show trains</label>
          <input
            type="checkbox"
            checked={showTrains}
            id="showTrains"
            onChange={() => this.setBool('showTrains', !showTrains)}
          ></input>
        </div>
        <button type="button" onClick={() => this.signOut()}>
          Logg ut
        </button>
        <button type="button" onClick={() => window.location.reload()}>
          Last inn på nytt
        </button>
      </div>
    );
  }
}

export default Settings;
