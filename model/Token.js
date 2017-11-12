const dbManager = require('../model/db-manager');
const tokenManager = require('../utils/token-manager');
const Token = tokenManager.Token;

const table = 'tokens';

class TokenModel extends Token {
    /**
    * Crea una instancia de un token firmado.
    * @constructor
    * @this {Token}
    * @param {string} token Token firmado.
    * @param {number} expiresAt Tiempo de expiracion en milisegundos.
    * @param {string} owner A que entidad pertenece el token (ej: servidor de aplicaciones)
    * @return {TokenModel} Nuevo token.
    */
    constructor(token, expiresAt, owner = '') {
        super(token, expiresAt);
        this.owner = owner;
    }

    withoutOwner() {
        this.owner = undefined;
        return this;
    }
}

function fromObj(tok) {
    if (!tok) return null;
    const { token, owner, expiresAt = tok.expiresat } = tok;
    return new TokenModel(token, expiresAt, owner);
}

TokenModel.fromObj = fromObj;

TokenModel.table = table;

/* istanbul ignore next */
TokenModel.insert = function (token, owner, callback) {
    token = fromObj(token).withDateExpiration();
    const sql = `INSERT INTO ${table}(token,expiresAt,owner) VALUES($1,$2,$3) RETURNING *`;

    dbManager.query(sql, [token.token, token.expiresAt, owner],
        (err, { rows }) => callback(err, fromObj(rows[0])));
};

/* istanbul ignore next */
TokenModel.findToken = function (token, callback) {
    const tokenId = token.token || token;
    const sql = `SELECT * FROM ${table} WHERE token=$1`;
    dbManager.query(sql, [tokenId],
        (err, { rows }) => callback(err, fromObj(rows[0])));
};

/**
 * Obtiene el ultimo token de un apoderado de token.
 * @param {string} owner Id del apoderado del token.
 * @param {Function} callback Funcion a invocar luego de obtener el token.
 */
/* istanbul ignore next */
TokenModel.findByOwner = function (owner, callback) {
    const ownerId = owner.id || owner;
    const sql = `SELECT * FROM ${table} WHERE owner=$1 ORDER BY counter DESC LIMIT 1`;
    dbManager.query(sql, [ownerId],
        (err, { rows }) => callback(err, fromObj(rows[0])));
};

/* istanbul ignore next */
TokenModel.invalidate = function (token, callback) {
    const tokenId = token.token || token;
    const sql = `DELETE FROM ${table} WHERE token=$1 RETURNING *`;
    dbManager.query(sql, [tokenId],
        (err, { rows }) => callback(err, fromObj(rows[0])));
};

/* istanbul ignore next */
TokenModel.invalidateTokensOwnedBy = function (owner, callback) {
    const sql = `DELETE FROM ${table} WHERE owner=$1 RETURNING *`;

    dbManager.query(sql, [owner], (err, {rows}) => {
        if (err) return callback(err);
        const tokens = rows.map(row => fromObj(row));
        return callback(null, tokens);
    });
};

module.exports = TokenModel;