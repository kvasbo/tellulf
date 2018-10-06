import React from 'react';
import Moment from 'moment';
import { Provider } from 'react-redux';
import 'moment/locale/nb';
import Tellulf from './Tellulf';
import firebase from './firebase';
import { store } from './redux/store';

Moment.locale('nb');

window.firebase = firebase;

class App extends React.PureComponent {
  getApp() {
    return (
      <Provider store={store}>
        <Tellulf />
      </Provider>
    );
  }

  render() {
    return this.getApp();
  }
}

export default App;
