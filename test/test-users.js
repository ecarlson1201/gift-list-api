"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require('mongoose');
mongoose.Promise = global.Promise

const expect = chai.expect;

const { Account } = require('../gifts/models');
const { User } = require('../user/models')
const { app, runServer, closeServer } = require('../server.js');
const { TEST_DATABASE_URL } = require('../config.js');

chai.use(chaiHttp);

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
};

describe("Users API", function () {
    const username = 'test-user'
    const password = 'test-password'

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer()
    });

    describe('POST to /api/users', function () {
        it('Should reject users with missing username', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ password })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('username');
                    expect(res.body.message).to.equal('Missing field');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should reject users with missing password', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('password');
                    expect(res.body.message).to.equal('Missing field');
                    expect(res.body.reason).to.equal('ValidationError');
                })
        });
        it('Should reject username starting/ending with whitespace', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username: ` ${username} `, password })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('username');
                    expect(res.body.message).to.equal('Cannot start or end with whitespace');
                    expect(res.body.reason).to.equal('ValidationError');
                })
        });
        it('Should reject password starting/ending with whitespace', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username, password: ` ${password} ` })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('password');
                    expect(res.body.message).to.equal('Cannot start or end with whitespace');
                    expect(res.body.reason).to.equal('ValidationError');
                })
        });
        it('Should reject users with non-string password', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username, password: null })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('password');
                    expect(res.body.message).to.equal('Incorrect field type: expected string');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should reject users with non-string username', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username: null, password })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('username');
                    expect(res.body.message).to.equal('Incorrect field type: expected string');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should reject users with password less than 8 characters', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username, password: '1234' })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('password');
                    expect(res.body.message).to.equal('Must be at least 8 characters long')
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should reject users with username less than 4 characters', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username: '123', password })
                .then((res) => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('username');
                    expect(res.body.message).to.equal('Must be at least 4 characters long')
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should reject users with duplicate username', function () {
            return User.create({ username, password })
                .then(() => {
                    return chai.request(app)
                        .post('/api/users')
                        .send({ username, password })
                })
                .then(res => {
                    expect(res).to.have.status(422);
                    expect(res.body.location).to.equal('username');
                    expect(res.body.message).to.equal('Username already taken');
                    expect(res.body.reason).to.equal('ValidationError');
                });
        });
        it('Should create a new user', function () {
            return chai.request(app)
                .post('/api/users')
                .send({ username, password })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.keys('username');
                    expect(res.body.username).to.equal(username)
                    return User.findOne({username});
                })
                .then(user =>{
                    expect(user).to.not.be.null;
                    expect(user.username).to.equal(username);
                    return user.validatePassword(password);
                })
                .then(correctPassword =>{
                    expect(correctPassword).to.be.true;
                });
        });
    });
});