import firebase from 'firebase';
import Moment from 'moment';
import 'moment/locale/nb';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import solarUpdater from './solarUpdater';
import Tellulf from './Tellulf';
import tibberUpdater from './tibberUpdater';
import { GenericProps } from './types/generic';

Moment.locale('nb');

const firebaseConfig = {
  apiKey: 'AIzaSyBIJfOzVFrazxX9FkLEOHcf2dKeewXBCpI',
  authDomain: 'tellulf-151318.firebaseapp.com',
  databaseURL: 'https://tellulf-151318.firebaseio.com',
  projectId: 'tellulf-151318',
  storageBucket: 'tellulf-151318.appspot.com',
  messagingSenderId: '159155087298',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// window.firebase = firebase;
const tibber = new tibberUpdater(store, firebase);
const solar = new solarUpdater(store, firebase);

const updaters = { tibber, solar };

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
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ loggedIn: true, user });
      }
    });
  }

  private doLogin() {
    if (!this.state.username || !this.state.password)
      alert('Tast inn brukernavn og passord din slask');
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.username, this.state.password)
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
            onClick={() => this.doLogin()}
          >
            Logg inn
          </button>
        </div>
      </div>
    );
  }

  public render(): React.ReactNode {
    if (!this.state.loggedIn) return this.getLogin();
    return (
      <Provider store={store}>
        <Tellulf loggedIn={this.state.loggedIn} updaters={updaters} />
      </Provider>
    );
  }
}

export default App;
