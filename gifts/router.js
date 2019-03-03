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

router.post('/gifts', jsonParser, (req, res) => {
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

router.post('/lists/:userId', jsonParser, (req, res) => {
    const requiredFields = 'title';
    const user = req.params.userId;

    let newList = {
        title: req.body.title,
        gifts: []
    };

    if (!(requiredFields in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message)
    };

    List
        .create(newList)
        .then((list) => {
            newList = list;
            return Account.findOne({ user: user });
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
});

router.delete('/lists/:userId', jsonParser, (req, res) => {
    let toBeDeleted = req.body._id;
    const user = req.params.userId;

    function arrayRemove(arr, value) {
        return arr.filter(function (ele, index) {
            return index !== value;
        });
    };

    List
        .deleteOne({ _id: { $in: toBeDeleted } })
        .then((list) => {
            Account
                .findOne({ user: user })
                .then(account => {
                    console.log(account.lists)
                    let newLists = arrayRemove(account.lists, toBeDeleted)
                    console.log(newLists)
                    Account.findByIdAndUpdate(account.id, { lists: newLists })
                        .then(response => { res.status(204).json({ messag: "List Deletion successful" }) })
                })
        })
        .catch(err => { res.status(500).json({ error: "something went terribly wrong deleting a list" }) });
});

router.put('/lists', jsonParser, (req, res) => {
    let updatedGifts = { gifts: req.body.gifts }

    List
        .findOneAndUpdate({ _id: req.body._id }, { $set: updatedGifts })
        .then(response => { res.status(200).json({ message: "updated gift list" }) })
        .catch(err => res.status(500).json({ message: "Something went horribly wrong updating the gift list" }));
});
module.exports = { router };