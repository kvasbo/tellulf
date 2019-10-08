import { Timber } from '@timberio/node';
import * as firebase from 'firebase/app';
import Netatmo from './netatmo.js';
import StecaParser from './solar.js';
import Tibber from './tibber.js';

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

firebase.initializeApp(firebaseConfig);

const timberApiKey = process.env.TIMBER_API_KEY ? process.env.TIMBER_API_KEY : 'abc';
const logger = new Timber(timberApiKey, '23469', { ignoreExceptions: true });

logger.info('Tellulf server started');

function init() {
  if (!process.env.NETATMO_USERNAME) throw Error('NETATMO_USERNAME not set');
  if (!process.env.NETATMO_PASSWORD) throw Error('NETATMO_PASSWORD not set');
  if (!process.env.NETATMO_CLIENT_SECRET) throw Error('NETATMO_CLIENT_SECRET not set');
  if (!process.env.NETATMO_CLIENT_ID) throw Error('NETATMO_CLIENT_ID not set');
  if (!process.env.FIREBASE_USER) throw Error('FIREBASE_USER not set');
  if (!process.env.FIREBASE_PASSWORD) throw Error('FIREBASE_PASSWORD not set');

  firebase
    .auth()
    .signInWithEmailAndPassword(process.env.FIREBASE_USER, process.env.FIREBASE_PASSWORD)
    .catch(function(error: ErrorEvent) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    });
}

function start() {
  // eslint-disable-next-line no-console
  console.log('Starting.');
  const netatmoConfig = {
    username: process.env.NETATMO_USERNAME,
    password: process.env.NETATMO_PASSWORD,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: process.env.NETATMO_CLIENT_ID,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_secret: process.env.NETATMO_CLIENT_SECRET,
  };

  const mySteca = new StecaParser('192.168.1.146', firebase, logger);
  mySteca.start(10000);

  const myNetatmo = new Netatmo(netatmoConfig, firebase, logger);
  myNetatmo.start(5);

  const tibberConnectorHjemme = new Tibber(
    process.env.TIBBER_KEY,
    [process.env.TIBBER_HOME, process.env.TIBBER_CABIN],
    firebase,
    logger,
  );
  tibberConnectorHjemme.start();
  // eslint-disable-next-line no-console
  console.log('Started.');
}

process.on('uncaughtException', function(err) {
  // eslint-disable-next-line no-console
  logger.error(err.message);
  // console.log('Caught exception: ' + err);
});

firebase.auth().onAuthStateChanged((user: firebase.User | null): void => {
  if (user) {
    start();
  }
});

try {
  init();
} catch (err) {
  logger.error(err.message);
  // eslint-disable-next-line no-console
  console.log(err.message);
}
