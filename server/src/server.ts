import axios from 'axios';
import express from 'express';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.get('/proxy', async (req: any, res) => {
  console.log('Get', req.query.url);
  axios
    .get(req.query.url)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .then((data: any) => {
      res.send(data.data);
      return;
    })
    .catch((err) => {
      console.log(err);
    });
});

process.on('uncaughtException', function (err) {
  // eslint-disable-next-line no-console
  console.log('Caught exception: ' + err);
});
