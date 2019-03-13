'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const expect = chai.expect;
chai.use(chaiHttp);

const { User } = require('../user/models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config');

describe('Auth endpoints', function () {
    const username = 'testuser';
    const password = 'testpassword';

    let id = null;

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    after(function () {
        return closeServer();
    });

    beforeEach(function () {
        return User.hashPassword(password).then(password =>
            User.create({ username, password }))
            .then(user => id = user.id);
    });
    afterEach(function () {
        return User.remove({});
    });

    describe('POST /api/auth/login', function () {
        it('Should reject requests with no credentials', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .then((res) => {
                    expect(res).to.have.status(400);
                });
        });
        it('Should reject requests with incorrect username', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username: 'differentUser', password })
                .then((res) => {
                    expect(res).to.have.status(401);
                });
        });
        it('Should reject requests with incorrect password', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username, password: 'differentPassword' })
                .then((res) => {
                    expect(res).to.have.status(401);
                });
        });
        it('Should return a valid JWT', function () {
            return chai.request(app)
                .post('/api/auth/login')
                .send({ username, password })
                .then((res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const token = res.body.authToken;
                    expect(token).to.be.a('string');
                    const response = jwt.verify(token, JWT_SECRET, { algorithm: ['HS256'] });
                    expect(response.user.username).to.equal(username)
                });
        });
    });

    describe('POST /api/auth/refresh', function () {
        it('Should return a valid auth token with a new expiry date', function () {
            const token = jwt.sign(
                { user: { username } },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: JWT_EXPIRY
                }
            );
            const decoded = jwt.decode(token);
            return chai.request(app)
                .post('/api/auth/refresh')
                .set('authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.an('object');
                    const authToken = res.body.authToken
                    expect(authToken).to.be.a('string');
                    const response = jwt.verify(authToken, JWT_SECRET, {
                        algorithm: ['HS256']
                    });
                    expect(response.user).to.deep.equal({username});
                    expect(response.exp).to.be.at.least(decoded.exp);
                });
        });
    });
});