import * as React from 'react';
import firebase from './firebase';
import store from 'store';

class Settings extends React.PureComponent<{}, {}> {
  setBool = (key: string, value: boolean) => {
    store.set(key, value);
    window.location.reload();
  };

  public render() {
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
        <button type="button" onClick={() => firebase.auth().signOut()}>
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
