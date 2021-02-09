"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = __importDefault(require("express"));
const firebase = __importStar(require("firebase/app"));
const netatmo_1 = __importDefault(require("./netatmo"));
const tibber_1 = __importDefault(require("./tibber"));
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
const app = express_1.default();
const port = process.env.HTTP_PORT;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'false');
    next();
});
app.use(express_1.default.static('../client/build'));
app.listen(port, () => {
    console.log(`Serving static files at ${port}`);
});
app.get('/proxy', async (req, res) => {
    console.log('Get', req.query.url);
    axios_1.default
        .get(req.query.url)
        .then((data) => {
        res.send(data.data);
        return;
    })
        .catch((err) => {
        console.log(err);
    });
});
const fb = firebase.initializeApp(firebaseConfig);
4;
function init() {
    if (!process.env.FIREBASE_USER)
        throw Error('FIREBASE_USER not set');
    if (!process.env.FIREBASE_PASSWORD)
        throw Error('FIREBASE_PASSWORD not set');
    firebase
        .auth()
        .signInWithEmailAndPassword(process.env.FIREBASE_USER, process.env.FIREBASE_PASSWORD)
        .catch(function (error) {
        console.log(error.message);
    });
}
function start() {
    console.log('Starting.');
    if (!process.env.NETATMO_USERNAME ||
        !process.env.NETATMO_PASSWORD ||
        !process.env.NETATMO_CLIENT_ID ||
        !process.env.NETATMO_CLIENT_SECRET) {
        console.log('Netatmo config incomplete, quitting');
        return;
    }
    const netatmoConfig = {
        username: process.env.NETATMO_USERNAME,
        password: process.env.NETATMO_PASSWORD,
        client_id: process.env.NETATMO_CLIENT_ID,
        client_secret: process.env.NETATMO_CLIENT_SECRET,
    };
    const myNetatmo = new netatmo_1.default(netatmoConfig, fb);
    myNetatmo.start(5);
    const tibberKey = process.env.TIBBER_KEY ? process.env.TIBBER_KEY : 'nokey';
    const tibberHome = process.env.TIBBER_HOME ? process.env.TIBBER_HOME : 'nokey';
    const tibberCabin = process.env.TIBBER_CABIN ? process.env.TIBBER_CABIN : 'nokey';
    const tibberConnectorHjemme = new tibber_1.default(tibberKey, [tibberHome, tibberCabin], fb);
    tibberConnectorHjemme.start();
    console.log('Started.');
}
process.on('uncaughtException', function (err) {
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
    console.log(err.message);
}
