'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Account, Gift, List } = require('./models');
const { router: authRouter } = require('../auth/router');
const { localStrategy, jwtStrategy } = require('../auth/strategies');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/:userId', (req, res) => {
    const user = req.params.userId;
    Account
        .findOne({ user: user })
        .then(session => res.json(session))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
});

module.exports = { router };