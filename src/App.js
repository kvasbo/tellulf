import React, { Component } from 'react';
import Moment from 'moment';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import Login from './Login';
import firebase from './firebase';

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
    if (this.state.loggedIn) {
      return <Tellulf />;
    }
    return <Login />;
  }

  render() {
    return this.getApp();
  }
}

export default App;
