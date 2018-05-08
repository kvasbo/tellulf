import React, { Component } from 'react';
import Moment from 'moment';
import { createStore } from 'redux';
import storage from 'redux-persist/lib/storage';
import { Provider } from 'react-redux';
import 'moment/locale/nb';
import tellulfReducer from './redux/reducers';
import Tellulf from './Tellulf';
import Login from './Login';
import firebase from './firebase';

const store = createStore(
  tellulfReducer, /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
 );

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
      return (
        <Provider store={store}>
          <Tellulf />
        </Provider>
      );
    }
    return <Login />;
  }

  render() {
    return this.getApp();
  }
}

export default App;
