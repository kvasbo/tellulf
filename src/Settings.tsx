import * as React from 'react';
import firebase from './firebase';
class Settings extends React.PureComponent<{}, {}> {
  public render() {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
        onClick={() => {}}
      >
        <span
          style={{
            alignItems: 'center',
            color: '#ffffff',
            fontSize: 75,
            fontWeight: 200,
          }}
        >
          <span>
            <button type="button" onClick={() => firebase.auth().signOut()}>
              Logg ut
            </button>
            <button type="button" onClick={() => window.location.reload()}>
              Last inn på nytt
            </button>
          </span>
        </span>
      </div>
    );
  }
}

export default Settings;
