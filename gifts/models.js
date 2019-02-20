'use strict';

const mongoose = require("mongoose");
mongoose.Promise = global.Promise

const giftSchema = mongoose.Schema({
    name: { type: String, required: true },
    price: { type: String, required: true },
    holiday: { type: String, required: true },
    recipient: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true }
});

const listSchema = mongoose.Schema({
    title: { type: String, required: true },
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: Gift }]
});

const accountSchema = mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    data: [{ type: mongoose.Schema.Types.ObjectId, ref: List }]
});

const Gift = mongoose.model('Gift', giftSchema);
const List = mongoose.model('List', listSchema);
const Account = mongoose.model('Account', accountSchema);

module.exports = { Gift, List, Account };