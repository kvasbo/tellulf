const functions = require('firebase-functions');
const axios = require('axios');
const express = require('express');

const app = express();

app.use((req, res, next) => {
  console.log("middleware");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Credentials", "false");
  next();
});

app.get('/', (req, res) => {
  console.log('Get', req.query.url);
  axios.get(req.query.url).then((data) => {
    res.send(data.data);
  }).catch((err) => {
    console.log(err);
  });
});

exports.proxy = functions.https.onRequest(app);
