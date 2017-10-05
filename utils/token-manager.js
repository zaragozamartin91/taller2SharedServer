const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const conf = require('../config/main-config');
const moment = require('moment');

const secret = conf.tokenSecret;
const defaultExpirationTime = 60 * 24 * 30; // duracion de un mes
const defaultExpirationTimeUnits = 'm';

/**
 * Representa un token de identificacion
 */
class Token {
    /**
     * Crea una instancia de un token firmado.
     * @constructor
     * @this {Token}
     * @param {string} token Token firmado.
     * @param {number} expiresAt Tiempo de expiracion en milisegundos.
     * @return {Token} Nuevo token.
     */
    constructor(token, expiresAt) {
        this.token = token;
        this.expiresAt = expiresAt;
    }
    verify(callback) {
        verifyToken(this.token, callback);
    }
    /**
     * Convierte la fecha de expiracion a Date.
     * @this {Token}
     * @return {Token} this.
     */
    withDateExpiration() {
        if (typeof this.expiresAt == 'object') return this;
        this.expiresAt = new Date(this.expiresAt);
        return this;
    }
    /**
     * Convierte la fecha de expiracion a timestamp (en milisegundos).
     * @this {Token}
     * @return {Token} this.
     */
    withTimestampExpiration() {
        if (typeof this.expiresAt == 'number') return this;
        this.expiresAt = this.expiresAt.getTime();
        return this;
    }
}


/**
 * Crea y firma un token.
 * @param {object} obj Objeto a usar para crear y firmar el token.
 * @param {Number} expirationMins Tiempo de expiracion en minutos.
 * @return {Token} Nuevo token.
 */
function signToken(obj, expirationMins = defaultExpirationTime) {
    const token = jwt.sign(obj, secret, {
        expiresIn: `${expirationMins}${defaultExpirationTimeUnits}`
    });
    const expiresAt = moment().add(expirationMins, defaultExpirationTimeUnits).toDate().getTime();

    return new Token(token, expiresAt);
}

/**
 * Verifica un token.
 * @param {any} token String o objeto token firmado a verificar. 
 * @param {Function} callback Funcion a invocar cuando se haya verificado el token.
 */
function verifyToken(token, callback) {
    token = token.token || token;
    jwt.verify(token, secret, callback);
}

/**
 * Genera un token firmado a partir de un objeto de tipo servidor de aplicaciones.
 * @param {object} server servidor de aplicaciones a partir del cual generar el token.
 */
exports.signServer = function ({ id }) {
    return signToken({ id });
};

exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.Token = Token;

exports.defaultExpirationTime = defaultExpirationTime;
exports.defaultExpirationTimeUnits = defaultExpirationTimeUnits;