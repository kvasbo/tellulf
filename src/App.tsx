import React from 'react';
import Moment from 'moment';
import { Provider } from 'react-redux';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import firebase from './firebase';
import { store } from './redux/store';
import tibberUpdater from './tibberUpdater';
import solarUpdater from './solarUpdater';

Moment.locale('nb');

// window.firebase = firebase;
const tibber = new tibberUpdater(store);
const solar = new solarUpdater(store);

interface AppState {
  loggedIn: boolean;
  user: number | null;
  username: string;
  password: string;
}

const bugsnagClient = bugsnag({
  apiKey: '4676dc34576830eae89fbdd54dd96c96',
  // otherOptions: value
});
bugsnagClient.use(bugsnagReact, React);
const ErrorBoundary = bugsnagClient.getPlugin('react');

class App extends React.PureComponent {
  public state: AppState;

  public constructor(props: {}) {
    super(props);
    this.state = { loggedIn: false, user: null, username: '', password: '' };
  }

  public componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({ loggedIn: true, user });
        tibber.updatePowerPrices();
        tibber.subscribeToRealTime();
        tibber.updateConsumption();
        tibber.updateConsumptionMonthlyAndCalculateBills();
        tibber.updateConsumptionDaily();
        setInterval(() => tibber.updateConsumption(), 60 * 1000); // Every minute
        solar.attachListeners();
        solar.attachMaxListeners();
      }
    });
  }

  private doLogin() {
    if (!this.state.username || !this.state.password)
      alert('Tast inn brukernavn og passord din slask');
    firebase
      .auth()
      .signInWithEmailAndPassword(this.state.username, this.state.password)
      .catch(error => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
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
          height: '100%',
          flexDirection: 'column',
        }}
      >
        <div>
          <input
            type="text"
            value={this.state.username}
            placeholder="Brukernavn"
            onChange={event => this.setState({ username: event.target.value })}
          />
        </div>
        <div>
          <input
            type="text"
            value={this.state.password}
            placeholder="Passord"
            onChange={event => this.setState({ password: event.target.value })}
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

  public render() {
    if (!this.state.loggedIn) return this.getLogin();
    return (
      <ErrorBoundary>
        <Provider store={store}>
          <Tellulf loggedIn={this.state.loggedIn} />
        </Provider>
      </ErrorBoundary>
    );
  }
}

export default App;
