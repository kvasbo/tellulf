import React, { Component } from 'react';
import Moment from 'moment';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import firebase from './firebase';
import { store, persistor } from './redux/store';

Moment.locale('nb');

window.firebase = firebase;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false };

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({ loggedIn: true });
        // ...
      } else {
        this.setState({ loggedIn: false });
      }
    });
  }

  getApp() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Tellulf />
        </PersistGate>
      </Provider>
    );
  }

  render() {
    return this.getApp();
  }
}

export default App;
