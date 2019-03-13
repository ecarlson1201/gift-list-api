'use strict';

//exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://user1:password1@ds341825.mlab.com:41825/giftlist';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/giftList';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/testGiftList';

exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'mytestkey';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';