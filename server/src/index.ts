import { Timber } from '@timberio/node';
import * as firebase from 'firebase/app';
import express from 'express';
import axios from 'axios';
import Netatmo, { NetatmoConfig } from './netatmo.js';
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

// Set up static web server and proxy
const app = express();
const port = process.env.HTTP_PORT;
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Credentials', 'false');
  next();
});
app.use(express.static('../client/build'));
app.listen(port, () => {
  console.log(`Serving static files at ${port}`);
});
app.get('/proxy', async (req: any, res) => {
  console.log('Get', req.query.url);
  axios
    .get(req.query.url)
    .then((data: any) => {
      res.send(data.data);
      return;
    })
    .catch((err) => {
      console.log(err);
    });
});

const fb = firebase.initializeApp(firebaseConfig);

const timberApiKey = process.env.TIMBER_API_KEY ? process.env.TIMBER_API_KEY : 'abc';
const logger = new Timber(timberApiKey, '23469', { ignoreExceptions: true });

logger.info('Tellulf server started');

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
  // eslint-disable-next-line no-console
  console.log('Starting.');
  if (
    !process.env.NETATMO_USERNAME ||
    !process.env.NETATMO_PASSWORD ||
    !process.env.NETATMO_CLIENT_ID ||
    !process.env.NETATMO_CLIENT_SECRET
  ) {
    // eslint-disable-next-line no-console
    console.log('Netatmo config incomplete, quitting');
    return;
  }
  const netatmoConfig: NetatmoConfig = {
    username: process.env.NETATMO_USERNAME,
    password: process.env.NETATMO_PASSWORD,
    client_id: process.env.NETATMO_CLIENT_ID,
    client_secret: process.env.NETATMO_CLIENT_SECRET,
  };
  const myNetatmo = new Netatmo(netatmoConfig, fb, logger);
  myNetatmo.start(5);

  const mySteca = new StecaParser('192.168.1.146', fb, logger);
  mySteca.start(10000);

  const tibberKey = process.env.TIBBER_KEY ? process.env.TIBBER_KEY : 'nokey';
  const tibberHome = process.env.TIBBER_HOME ? process.env.TIBBER_HOME : 'nokey';
  const tibberCabin = process.env.TIBBER_CABIN ? process.env.TIBBER_CABIN : 'nokey';

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
