import React from 'react';
import Moment from 'moment';
import { Provider } from 'react-redux';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import firebase from './firebase.ts';
import { store } from './redux/store.ts';
import tibberUpdater from './tibberUpdater.ts';

Moment.locale('nb');

window.firebase = firebase;
const tibber = new tibberUpdater(store);

const bugsnagClient = bugsnag({
  apiKey: '4676dc34576830eae89fbdd54dd96c96',
  // otherOptions: value
});
bugsnagClient.use(bugsnagReact, React);
const ErrorBoundary = bugsnagClient.getPlugin('react');

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false, user: null, username: '', password: '' };
  }

  componentDidMount() {
    // firebase.auth().signInAnonymously();
    tibber.updatePowerPrices();
    tibber.subscribeToRealTime();

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ loggedIn: true, user });
      }
    });
  }

  getLoggingIn() {
    return (
      <div>Logger inn...</div>
    );
  }

  doLogin() {
    if (!this.state.username || !this.state.password) alert("Tast inn brukernavn og passord din slask");
    firebase.auth().signInWithEmailAndPassword(this.state.username, this.state.password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      alert(`${errorCode} ${errorMessage}`);
      this.setState({ username: null, password: null })
    });
  }

  getLogin() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, margin: 0, height: '100%', flexDirection: 'column' }}>
        <div><input type="text" value={this.state.username} placeholder="Brukernavn" onChange={(event) => this.setState({ username: event.target.value })} /></div>
        <div><input type="text" value={this.state.password} placeholder="Passord" onChange={(event) => this.setState({ password: event.target.value })} /></div>
        <div><button disabled={(!this.state.username && !this.state.password )} onClick={() => this.doLogin()}>Logg inn</button></div>
      </div>
    );
  }

  render() {
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
