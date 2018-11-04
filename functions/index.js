const functions = require('firebase-functions');
const axios = require('axios');
const express = require('express');

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/:url', (req, res) => {
  console.log('Get', req.params.url);
  axios.get(req.params.url).then((data) => {
    res.send(data.data);
  }).catch((err) => {
    console.log(err);
  });
});

exports.proxy = functions.https.onRequest(app);
