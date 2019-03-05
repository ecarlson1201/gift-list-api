'use strict';

const express = require('express');
const passport = require('passport');
const router = express.Router();
const { User } = require('../user/models')

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Account, Gift, List } = require('./models');
const { router: authRouter } = require('../auth/router');
const { localStrategy, jwtStrategy } = require('../auth/strategies');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/lists/protected', jwtAuth, (req, res) => {
    const username = req.user.username
    User.findOne({ username: username })
        .then(user => {
            Account
                .findOne({ user: user._id })
                .then(session => res.json(session))
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Something went wrong' });
                });
        })
});

router.post('/gifts', jwtAuth, jsonParser, (req, res) => {
    const requiredFields = ['name', 'price', 'holiday', 'recipient', 'description', 'link', 'image']
    let newGift = {
        name: req.body.name,
        price: req.body.price,
        holiday: req.body.holiday,
        recipient: req.body.recipient,
        description: req.body.description,
        link: req.body.link,
        image: req.body.image
    };

    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message)
        };
    };

    Gift
        .create(newGift)
        .then(() => {
            res.status(201).json(newGift)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went terribly wrong' })
        });
});

router.post('/lists/protected', jwtAuth, jsonParser, (req, res) => {
    const requiredFields = 'title';
    const username = req.user.username

    let newList = {
        title: req.body.title,
        gifts: []
    };

    if (!(requiredFields in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message)
    };

    User.findOne({ username: username })
        .then(user => {
            List
                .create(newList)
                .then((list) => {
                    newList = list;
                    return Account.findOne({ user: user._id });
                })
                .then((account) => {
                    account.lists.push(newList);
                    return account.save(function () { });
                })
                .then((savedAccount) => {
                    res.status(201).json(newList)
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'something went horribly wrong' });
                })
        })
});

router.delete('/lists/protected', jwtAuth, jsonParser, (req, res) => {
    let toBeDeleted = req.body._id;
    const username = req.user.username

    User.findOne({ username: username })
        .then(user => {
            List
                .deleteOne({ _id: { $in: toBeDeleted } })
                .then((list) => {
                    Account
                        .findOne({ user: user._id })
                        .then(account => {
                            let newLists = account.lists.reduce((acc, val, index) => {
                                if (account.lists[index] == toBeDeleted) {
                                    account.lists.splice(index, 1)
                                };
                                return acc
                            }, account.lists)
                            Account.findByIdAndUpdate(account.id, { lists: newLists })
                                .then(response => { res.status(204).json({ message: "List seletion successful" }) })
                        })
                })
                .catch(err => { res.status(500).json({ error: "something went terribly wrong deleting a list" }) });
        })

});

router.put('/lists/protected', jwtAuth, jsonParser, (req, res) => {
    let gifts = { gifts: req.body.gifts }
    let list = req.body._id

    List
        .findOneAndUpdate({ _id: list }, { $set: gifts })
        .then(response => { res.status(200).json({ message: "updated gift list" }) })
        .catch(err => res.status(500).json({ message: "Something went horribly wrong updating the gift list" }));
});
module.exports = { router };