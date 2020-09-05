"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@timberio/node");
const firebase = __importStar(require("firebase/app"));
const netatmo_js_1 = __importDefault(require("./netatmo.js"));
const solar_js_1 = __importDefault(require("./solar.js"));
const tibber_js_1 = __importDefault(require("./tibber.js"));
const tellulf_keys_js_1 = __importDefault(require("./tellulf_keys.js"));
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
const timberApiKey = tellulf_keys_js_1.default.TIMBER_API_KEY ? tellulf_keys_js_1.default.TIMBER_API_KEY : 'abc';
const logger = new node_1.Timber(timberApiKey, '23469', { ignoreExceptions: true });
logger.info('Tellulf server started');
function init() {
    if (!tellulf_keys_js_1.default.NETATMO_USERNAME)
        throw Error('NETATMO_USERNAME not set');
    if (!tellulf_keys_js_1.default.NETATMO_PASSWORD)
        throw Error('NETATMO_PASSWORD not set');
    if (!tellulf_keys_js_1.default.NETATMO_CLIENT_SECRET)
        throw Error('NETATMO_CLIENT_SECRET not set');
    if (!tellulf_keys_js_1.default.NETATMO_CLIENT_ID)
        throw Error('NETATMO_CLIENT_ID not set');
    if (!tellulf_keys_js_1.default.FIREBASE_USER)
        throw Error('FIREBASE_USER not set');
    if (!tellulf_keys_js_1.default.FIREBASE_PASSWORD)
        throw Error('FIREBASE_PASSWORD not set');
    firebase
        .auth()
        .signInWithEmailAndPassword(tellulf_keys_js_1.default.FIREBASE_USER, tellulf_keys_js_1.default.FIREBASE_PASSWORD)
        .catch(function (error) {
        console.log(error.message);
    });
}
function start() {
    console.log('Starting.');
    if (!tellulf_keys_js_1.default.NETATMO_USERNAME ||
        !tellulf_keys_js_1.default.NETATMO_PASSWORD ||
        !tellulf_keys_js_1.default.NETATMO_CLIENT_ID ||
        !tellulf_keys_js_1.default.NETATMO_CLIENT_SECRET) {
        console.log('Netatmo config incomplete, quitting');
        return;
    }
    const netatmoConfig = {
        username: tellulf_keys_js_1.default.NETATMO_USERNAME,
        password: tellulf_keys_js_1.default.NETATMO_PASSWORD,
        client_id: tellulf_keys_js_1.default.NETATMO_CLIENT_ID,
        client_secret: tellulf_keys_js_1.default.NETATMO_CLIENT_SECRET,
    };
    const myNetatmo = new netatmo_js_1.default(netatmoConfig, fb, logger);
    myNetatmo.start(5);
    const mySteca = new solar_js_1.default('192.168.1.146', fb, logger);
    mySteca.start(10000);
    const tibberKey = tellulf_keys_js_1.default.TIBBER_KEY ? tellulf_keys_js_1.default.TIBBER_KEY : 'nokey';
    const tibberHome = tellulf_keys_js_1.default.TIBBER_HOME ? tellulf_keys_js_1.default.TIBBER_HOME : 'nokey';
    const tibberCabin = tellulf_keys_js_1.default.TIBBER_CABIN ? tellulf_keys_js_1.default.TIBBER_CABIN : 'nokey';
    const tibberConnectorHjemme = new tibber_js_1.default(tibberKey, [tibberHome, tibberCabin], fb, logger);
    tibberConnectorHjemme.start();
    console.log('Started.');
}
process.on('uncaughtException', function (err) {
    logger.error(err.message);
    console.log('Caught exception: ' + err);
});
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        start();
    }
});
try {
    init();
}
catch (err) {
    logger.error(err.message);
    console.log(err.message);
}
