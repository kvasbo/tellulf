import * as firebase from 'firebase/app';
import StecaParser from './solar';

require('firebase/auth');
require('firebase/database');

const firebaseConfig = {
  apiKey: 'AIzaSyBIJfOzVFrazxX9FkLEOHcf2dKeewXBCpI',
  authDomain: 'tellulf-151318.firebaseapp.com',
  databaseURL: 'https://tellulf-151318.firebaseio.com',
  projectId: 'tellulf-151318',
  storageBucket: 'tellulf-151318.appspot.com',
  messagingSenderId: '159155087298',
};

const fb = firebase.initializeApp(firebaseConfig);

function init() {
  if (!process.env.FIREBASE_USER) throw Error('FIREBASE_USER not set');
  if (!process.env.FIREBASE_PASSWORD) throw Error('FIREBASE_PASSWORD not set');
  firebase
    .auth()
    .signInWithEmailAndPassword(process.env.FIREBASE_USER, process.env.FIREBASE_PASSWORD)
    .catch(function (error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    });
}

function start() {
  if (!process.env.STECA_IP) throw Error('STECA_IP not set');
  const mySteca = new StecaParser(process.env.STECA_IP, fb);
  mySteca.start(10000);
}

firebase.auth().onAuthStateChanged((user: firebase.User | null): void => {
  if (user) {
    start();
  }
});

try {
  init();
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err.message);
}
