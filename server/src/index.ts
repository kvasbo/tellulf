import { Timber } from '@timberio/node';
import * as firebase from 'firebase/app';
import Netatmo, { NetatmoConfig } from './netatmo.js';
import StecaParser from './solar.js';
import Tibber from './tibber.js';

import keys from './tellulf_keys.js';

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

const timberApiKey = keys.TIMBER_API_KEY ? keys.TIMBER_API_KEY : 'abc';
const logger = new Timber(timberApiKey, '23469', { ignoreExceptions: true });

logger.info('Tellulf server started');

function init() {
  if (!keys.NETATMO_USERNAME) throw Error('NETATMO_USERNAME not set');
  if (!keys.NETATMO_PASSWORD) throw Error('NETATMO_PASSWORD not set');
  if (!keys.NETATMO_CLIENT_SECRET) throw Error('NETATMO_CLIENT_SECRET not set');
  if (!keys.NETATMO_CLIENT_ID) throw Error('NETATMO_CLIENT_ID not set');
  if (!keys.FIREBASE_USER) throw Error('FIREBASE_USER not set');
  if (!keys.FIREBASE_PASSWORD) throw Error('FIREBASE_PASSWORD not set');

  firebase
    .auth()
    .signInWithEmailAndPassword(keys.FIREBASE_USER, keys.FIREBASE_PASSWORD)
    .catch(function (error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    });
}

function start() {
  // eslint-disable-next-line no-console
  console.log('Starting.');
  if (
    !keys.NETATMO_USERNAME ||
    !keys.NETATMO_PASSWORD ||
    !keys.NETATMO_CLIENT_ID ||
    !keys.NETATMO_CLIENT_SECRET
  ) {
    // eslint-disable-next-line no-console
    console.log('Netatmo config incomplete, quitting');
    return;
  }
  const netatmoConfig: NetatmoConfig = {
    username: keys.NETATMO_USERNAME,
    password: keys.NETATMO_PASSWORD,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_id: keys.NETATMO_CLIENT_ID,
    // eslint-disable-next-line @typescript-eslint/camelcase
    client_secret: keys.NETATMO_CLIENT_SECRET,
  };
  const myNetatmo = new Netatmo(netatmoConfig, fb, logger);
  myNetatmo.start(5);

  const mySteca = new StecaParser('192.168.1.146', fb, logger);
  mySteca.start(10000);

  const tibberKey = keys.TIBBER_KEY ? keys.TIBBER_KEY : 'nokey';
  const tibberHome = keys.TIBBER_HOME ? keys.TIBBER_HOME : 'nokey';
  const tibberCabin = keys.TIBBER_CABIN ? keys.TIBBER_CABIN : 'nokey';

  const tibberConnectorHjemme = new Tibber(tibberKey, [tibberHome, tibberCabin], fb, logger);
  tibberConnectorHjemme.start();
  // eslint-disable-next-line no-console
  console.log('Started.');
}

process.on('uncaughtException', function (err) {
  logger.error(err.message);
  // eslint-disable-next-line no-console
  console.log('Caught exception: ' + err);
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
