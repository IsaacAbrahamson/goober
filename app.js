const express = require ('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const routes = require('./routes/routes');
const app = express();

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(`mongodb://IsaacAbrahamson:${process.env.GOOBER_PASS}.mlab.com:47842/goober`, {
    useMongoClient: true
  });

  app.use(morgan('dev')) // log routes
}

// serve static files
app.use(express.static('public'));

app.use(bodyParser.json());

// API routes
routes(app);

app.use((err, req, res, next) => {
  res.status(422).send({ error: err.message })
});

module.exports = app;
