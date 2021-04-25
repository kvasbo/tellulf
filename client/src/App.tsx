import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import Moment from 'moment';
import 'moment/locale/nb';
import React from 'react';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import Tellulf from './Tellulf';
import tibberUpdater from './tibberUpdater';
import { GenericProps } from './types/generic';

Moment.locale('nb');

export interface TibberSettings {
  tibberApiKey: string;
  tibberHomeKey: string;
  tibberCabinKey: string;
}

const firebaseConfig = {
  apiKey: 'AIzaSyBIJfOzVFrazxX9FkLEOHcf2dKeewXBCpI',
  authDomain: 'tellulf-151318.firebaseapp.com',
  databaseURL: 'https://tellulf-151318.firebaseio.com',
  projectId: 'tellulf-151318',
  storageBucket: 'tellulf-151318.appspot.com',
  messagingSenderId: '159155087298',
};

let fb: firebase.app.App;

if (!firebase.apps.length) {
  fb = firebase.initializeApp(firebaseConfig);
} else {
  fb = firebase.app(); // if already initialized, use that one
}

let tibberSettings: TibberSettings;

interface AppState {
  loggedIn: boolean;
  user: number | null;
  username: string;
  password: string;
}

class App extends React.PureComponent {
  public state: AppState;

  public constructor(props: GenericProps) {
    super(props);
    this.state = { loggedIn: false, user: null, username: '', password: '' };
  }

  public componentDidMount(): void {
    // Auto-login
    const params = new URLSearchParams(location.search);
    if (params.has('u') && params.has('p')) {
      const u = params.get('u');
      const p = params.get('p');
      this.setState({ u, p });
      if (u && p) {
        this.doLogin(u, p);
      }
    }

    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        tibberSettings = await this.getTibberSettings();

        this.setState({ loggedIn: true, user });
      }
    });
  }

  // Get tibber settings from firebase
  private async getTibberSettings(): Promise<TibberSettings> {
    const settingsRef = fb.database().ref('settings');
    const snapshot = await settingsRef.once('value');
    const data = snapshot.val() as TibberSettings;
    return data;
  }

  private doLogin(u: string, p: string) {
    if (!u || !p) alert('Tast inn brukernavn og passord din slask');
    firebase
      .auth()
      .signInWithEmailAndPassword(u, p)
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(`${errorCode} ${errorMessage}`);
        this.setState({ username: null, password: null });
      });
  }

  private getLogin() {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          margin: 0,
          height: '100vh',
          width: '100vw',
          flexDirection: 'column',
        }}
      >
        <div>
          <input
            type="text"
            value={this.state.username}
            placeholder="Brukernavn"
            onChange={(event) => this.setState({ username: event.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            value={this.state.password}
            placeholder="Passord"
            onChange={(event) => this.setState({ password: event.target.value })}
          />
        </div>
        <div>
          <button
            disabled={!this.state.username && !this.state.password}
            onClick={() => this.doLogin(this.state.username, this.state.password)}
          >
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  public render(): React.ReactNode {
    if (!this.state.loggedIn) return this.getLogin();
    const tibber = new tibberUpdater(store, tibberSettings);
    // tibber.updatePowerPrices();
    // tibber.subscribeToRealTime();

    const updaters = { tibber };
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Tellulf tibberSettings={tibberSettings} updaters={updaters} />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;

//
//
