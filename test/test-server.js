const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.Promise = global.Promise;

const expect = chai.expect;

const { Gift, List } = require('../gifts/models');
const { User } = require('../user/models');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET, JWT_EXPIRY } = require('../config.js');

chai.use(chaiHttp);

function generateUserData() {
  return {
    username: 'testuser',
    password: 'testpassword'
  };
};

function generateAccountData() {
  return {
    "user": username,
    "lists": ["5c38e5a557ab9000176ddbe5"]
  };
};

function generateListData() {
  return {
    _id: "5c38e5a557ab9000176ddbe8",
    title: "Dad",
    gifts: []
  };
};

function generateGiftData() {
  return [
    {
      _id: '5c38e5a557ab9000176ddbe7',
      name: "new gift",
      price: "$0-$20",
      holiday: "Birthday",
      recipient: "Friend",
      description: "It's a new gift",
      link: "http://link.com",
      image: "http://image.com"
    },
    {
      _id: '5c38e5a557ab9000176ddbe6',
      name: "another gift",
      price: "$20-$50",
      holiday: "Birthday",
      recipient: "Friend",
      description: "It's another gift",
      link: "http://link.com",
      image: "http://image.com"
    }
  ];
};

function seedListData() {
  return List.insertMany(generateListData());
};

function seedUserData() {
  return User.insertMany(generateUserData());
};

function seedGiftData() {
  return Gift.insertMany(generateGiftData());
};

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe("Accounts API Resource", function () {
  const username = 'testuser';
  const password = 'testpassword';

  const token = jwt.sign(
    { user: { username } },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      subject: username,
      expiresIn: JWT_EXPIRY
    }
  );

  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function () {
    return User.hashPassword(password).then(password =>
      User.create({ username, password }))
      .then(user => id = user.id)
      .then(res => seedGiftData())
      .then(res => seedListData())
  });

  afterEach(function () {
    return tearDownDb();
  });

  after(function () {
    return closeServer();
  });


  describe('GET endpoint for /api/accounts/lists/protected', function () {
    let res;
    it('Should allow access to account for authorized user', function () {
      return chai.request(app)
        .get('/api/accounts/lists/protected')
        .set('authorization', `Bearer ${token}`)
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200)
        });
    });
    it('Should prevent access to account for unauthorized user', function () {
      return chai.request(app)
        .get('/api/accounts/lists/protected')
        .catch(err => {
          err.should.be.an.instanceOf(Error)
        });
    });
  });
  describe('POST endpoint for /api/accounts/gifts', function () {
    let res;
    const newGift = {
      name: "new gift",
      price: "$0-$20",
      holiday: "Birthday",
      recipient: "Friend",
      description: "It's a new gift",
      link: "http://link.com",
      image: "http://image.com"
    };
    it('Should post the gift to the database', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send(newGift)
        .then(function (_res) {
          res = _res
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('name', 'price', 'holiday', 'recipient', '_id', '__v', 'description', 'link', 'image');
        });
    });
    it('Should not post gift to database without name', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          price: "$0-$20",
          holiday: "Birthday",
          recipient: "Friend",
          description: "It's a new gift",
          link: "http://link.com",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `name` in request body');
        });
    });
    it('Should not post gift to database without holiday', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          price: "$0-$20",
          recipient: "Friend",
          description: "It's a new gift",
          link: "http://link.com",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `holiday` in request body');
        });
    });
    it('Should not post gift to database without price', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          holiday: "Birthday",
          recipient: "Friend",
          description: "It's a new gift",
          link: "http://link.com",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `price` in request body');
        });
    });
    it('Should not post gift to database without recipient', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          price: "$0-$20",
          holiday: "Birthday",
          description: "It's a new gift",
          link: "http://link.com",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `recipient` in request body');
        });
    });
    it('Should not post gift to database without description', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          price: "$0-$20",
          holiday: "Birthday",
          recipient: "Friend",
          link: "http://link.com",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `description` in request body');
        });
    });
    it('Should not post gift to database without link', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          price: "$0-$20",
          holiday: "Birthday",
          recipient: "Friend",
          description: "It's a new gift",
          image: "http://image.com"
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `link` in request body');
        });
    });
    it('Should not post gift to database without image', function () {
      return chai.request(app)
        .post('/api/accounts/gifts')
        .send({
          name: "new gift",
          price: "$0-$20",
          holiday: "Birthday",
          recipient: "Friend",
          description: "It's a new gift",
          link: "http://link.com",
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(400);
          expect(res.text).to.equal('Missing `image` in request body');
        });
    });
  });
  describe('POST endpoint for /api/accounts/carousel', function () {
    let res;

    it('Should return carousel data', function () {
      return chai.request(app)
        .post('/api/accounts/carousel')
        .send({
          "holiday": "Birthday",
          "recipient": "Friend"
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.have.keys('holiday', 'recipient');
        });
    });
  });
  describe('POST endpoint for /api/accounts/gifts/search', function () {
    let res;

    it('Should return search data', function () {
      return chai.request(app)
        .post('/api/accounts/gifts/search')
        .send({
          "holiday": "Birthday"
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
          expect(res.body[0].holiday).to.equal('Birthday');
        });
    });
  });
  describe('POST endpoint for /api/accounts/giftsave/protected', function () {
    let res;
    it('Should update gift list ', () => {
      return chai.request(app)
        .post('/api/accounts/giftsave/protected')
        .set('authorization', `Bearer ${token}`)
        .send({
          gift: "5c38e5a557ab9000176ddbe7",
          list: "5c38e5a557ab9000176ddbe8",
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body).to.not.be.empty;
        });
    });
    it('Should prevent updating for unauthorized user', function () {
      return chai.request(app)
        .post('/api/accounts/giftsave/protected')
        .send({
          gift: "5c38e5a557ab9000176ddbe7",
          list: "5c38e5a557ab9000176ddbe8",
        })
        .catch(err => {
          err.should.be.an.instanceOf(Error)
        });
    });
  });
  describe('PUT endpoint for /api/accounts/lists/protected', function () {
    let res;
    it('Should delete gift from list', () => {
      return chai.request(app)
        .put('/api/accounts/lists/protected')
        .set('authorization', `Bearer ${token}`)
        .send({
          gift: "5c38e5a557ab9000176ddbe5",
          list: "5c38e5a557ab9000176ddbe8",
        })
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(204);
        });
    });
    it('Should prevent deleting for unauthorized user', function () {
      return chai.request(app)
        .put('/api/accounts/giftsave/protected')
        .send({
          gift: "5c38e5a557ab9000176ddbe7",
          list: "5c38e5a557ab9000176ddbe8",
        })
        .catch(err => {
          err.should.be.an.instanceOf(Error)
        });
    });
  });
});