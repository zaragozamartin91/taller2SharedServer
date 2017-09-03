const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const conf = require('../config/main-config');
const moment = require('moment');

const secret = conf.tokenSecret;
const defaultExpirationTime = 15;
const defaultExpirationTimeUnits = 'm';

exports.signToken = function (obj, expirationMins) {
    expirationMins = expirationMins || defaultExpirationTime;
    const token = jwt.sign(obj, secret, {
        expiresIn: `${expirationMins}${defaultExpirationTimeUnits}`
    });
    const expiresAt = moment().add(expirationMins, defaultExpirationTimeUnits)
        .toDate().getTime();

    return { token, expiresAt };
};

exports.verifyToken = function (token, callback) {
    token = token.token || token;
    jwt.verify(token, secret, callback);
};

exports.defaultExpirationTime = defaultExpirationTime;
exports.defaultExpirationTimeUnits = defaultExpirationTimeUnits;