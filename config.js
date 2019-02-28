'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/testGiftList';

exports.PORT = process.env.PORT || 8080;

exports.JWT_SECRET = process.env.JWT_SECRET || 'mytestkey';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';