const functions = require('firebase-functions');
const axios = require('axios');

const port = 3000;

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.proxy = functions.https.onRequest((request, response) => {
  
  axios.get(req.params.url).then(data => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.send(data.data);
  }).catch(err => console.error(err));

});

/*
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use((req, res, next) => {
  console.log('get', req.params);
  next();
});

app.get('/:url', async (req, res) => {
  try {
    const response = await axios.get(req.params.url);
    res.send(response.data);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => console.log(`Proxy listening on port ${port}!`))
*/