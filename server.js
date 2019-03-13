"use strict";
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyParser = require('body-parser');

const { CLIENT_ORIGIN, DATABASE_URL, PORT } = require('./config');
const { router: accountsRouter } = require('./gifts/router');
const { router: userRouter } = require('./user/router');
const { router: authRouter } = require('./auth/router');
const { localStrategy, jwtStrategy } = require('./auth/strategies');

mongoose.Promise = global.Promise;

const app = express();

app.use(morgan('common'));

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/accounts/', accountsRouter)
app.use('/api/users/', userRouter);
app.use('/api/auth/', authRouter);
app.use(express.static('public'));

const jwtAuth = passport.authenticate('jwt', { session: false });

app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'iliad'
  });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

app.get('/api/*', (req, res) => {
  res.json({ ok: true });
});

let server;

function runServer(database_url, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(database_url, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`App is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
};

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
};

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err))
}

module.exports = { runServer, app, closeServer };