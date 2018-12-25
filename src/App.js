import React from 'react';
import Moment from 'moment';
import { Provider } from 'react-redux';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import firebase from './firebase.ts';
import { store } from './redux/store.ts';

Moment.locale('nb');

window.firebase = firebase;

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false };
  }

  componentDidMount() {
    firebase.auth().signInAnonymously();

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ loggedIn: true });
      }
    });
  }

  getLoggingIn() {
    return (
      <div>Logger inn...</div>
    );
  }

  render() {
    if (!this.state.loggedIn) return this.getLoggingIn();
    return (
      <Provider store={store}>
        <Tellulf loggedIn={this.state.loggedIn} />
      </Provider>
    );
  }
}

export default App;
