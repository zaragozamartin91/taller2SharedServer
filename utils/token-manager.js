const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const conf = require('../config/main-config');
const moment = require('moment');

const secret = conf.tokenSecret;
const defaultExpirationTime = 15;
const defaultExpirationTimeUnits = 'm';

/**
 * Crea y firma un token.
 * @param {object} obj Objeto a usar para crear y firmar el token.
 * @param {Number} expirationMins Tiempo de expiracion en minutos.
 */
function signToken(obj, expirationMins) {
    expirationMins = expirationMins || defaultExpirationTime;
    const token = jwt.sign(obj, secret, {
        expiresIn: `${expirationMins}${defaultExpirationTimeUnits}`
    });
    const expiresAt = moment().add(expirationMins, defaultExpirationTimeUnits)
        .toDate().getTime();

    return { token, expiresAt };
}

exports.signToken = signToken;

/**
 * Verifica un token.
 * @param {any} token String o objeto token firmado a verificar. 
 * @param {Function} callback Funcion a invocar cuando se haya verificado el token.
 */
function verifyToken(token, callback) {
    token = token.token || token;
    jwt.verify(token, secret, callback);
}

exports.verifyToken = verifyToken;

exports.defaultExpirationTime = defaultExpirationTime;
exports.defaultExpirationTimeUnits = defaultExpirationTimeUnits;