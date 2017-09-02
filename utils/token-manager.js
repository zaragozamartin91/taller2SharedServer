const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const conf = require('../config/main-config');

const secret = conf.tokenSecret;
const defaultExp = 15;

exports.signToken = function (obj, expirationMins) {
    return jwt.sign(obj, secret, {
        expiresIn: `${expirationMins || defaultExp}m`
    });
};

exports.verifyToken = function (token, callback) {
    jwt.verify(token, secret, callback);
};
