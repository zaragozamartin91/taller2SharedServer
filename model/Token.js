const dbManager = require('../model/db-manager');
const tokenManager = require('../utils/token-manager');
const Token = tokenManager.Token;

const table = 'token';

/**
 * Crea una instancia de un token firmado.
 * @constructor
 * @this {Token}
 * @param {string} token Token firmado.
 * @param {number} expiresAt Tiempo de expiracion en milisegundos.
 * @param {string} owner A que entidad pertenece el token (ej: servidor de aplicaciones)
 * @return {TokenModel} Nuevo token.
 */
function TokenModel(token, expiresAt, owner) {
    this.token = token;
    this.expiresAt = expiresAt;
    this.owner = owner || '';
}

TokenModel.table = table;

TokenModel.insert = function (token, owner, callback) {
    token = Token.fromObj(token).withDateExpiration();
    if (typeof owner == 'function') {
        callback = owner;
        owner = '';
    }
    const sql = `INSERT INTO ${table}(token,expiresAt,owner) VALUES($1,$2,$3) RETURNING *`;

    dbManager.query(sql, [token.token, token.expiresAt, owner], (err, res) => {
        if (err) return callback(err);
        const dbToken = res.rows[0];
        return callback(null, Token.fromObj(dbToken));
    });
};

TokenModel.findById = function (token, callback) {
    const tokenId = token.token || token;
    const sql = `SELECT * FROM ${table} WHERE token=$1`;

    dbManager.query(sql, [], (err, { rows }) => callback(err, Token.fromObj(rows[0])));
};

TokenModel.verify = function (token, callback) {
    const tokenId = token.token || token;
    TokenModel.findById(tokenId, (err, dbToken) => {
        if (err) return callback(err);
        const tokenOk = dbToken && tokenManager.verifyToken(dbToken);
        callback(null, tokenOk);
    });
};

TokenModel.invalidate = function (token, callback) {
    const tokenId = token.token || token;
    const sql = `DELETE FROM ${table} WHERE token=$1 RETURNING *`;

    dbManager.query(sql, [tokenId], (err, res) => {
        if (err) return callback(err);
        const dbToken = res.rows[0];
        return callback(null, Token.fromObj(dbToken));
    });
};

TokenModel.invalidateTokensOwnedBy = function (owner, callback) {
    const sql = `DELETE FROM ${table} WHERE owner=$1 RETURNING *`;

    dbManager.query(sql, [owner], (err, res) => {
        if (err) return callback(err);
        const tokens = res.rows.map(row => Token.fromObj(row));
        return callback(null, tokens);
    });
};

module.exports = TokenModel;