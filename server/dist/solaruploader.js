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
const firebase = __importStar(require("firebase/app"));
const solar_1 = __importDefault(require("./solar"));
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
    if (!process.env.STECA_IP)
        throw Error('STECA_IP not set');
    const mySteca = new solar_1.default(process.env.STECA_IP, fb);
    mySteca.start(10000);
}
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
