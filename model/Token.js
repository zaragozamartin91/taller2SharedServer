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
 * @param {string} belongsTo A que entidad pertenece el token (ej: servidor de aplicaciones)
 * @return {TokenModel} Nuevo token.
 */
function TokenModel(token, expiresAt, belongsTo) {
    this.token = token;
    this.expiresAt = expiresAt;
    this.belongsTo = belongsTo || '';
}

TokenModel.createTable = function (callback) {
    const sql = `CREATE TABLE ${table} (
        token VARCHAR(256) NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        belongsTo VARCHAR(64) DEFAULT ''
    )`;
    dbManager.query(sql, [], callback);
};

TokenModel.dropTable = function (callback) {
    const sql = `DROP TABLE ${table}`;
    dbManager.query(sql, [], callback);
};

TokenModel.insert = function (token, belongsTo, callback) {
    token = Token.fromObj(token).withDateExpiration();
    if (typeof belongsTo == 'function') {
        callback = belongsTo;
        belongsTo = '';
    }
    const sql = `INSERT INTO ${table} VALUES($1,$2,$3) RETURNING *`;

    dbManager.query(sql, [token.token, token.expiresAt, belongsTo], (err, res) => {
        if (err) return callback(err);
        const dbToken = res.rows[0];
        return callback(null, Token.fromObj(dbToken));
    });
};

TokenModel.findById = function (token, callback) {
    const tokenId = token.token || token;
    const sql = `SELECT * FROM ${table} WHERE token=$1`;

    dbManager.query(sql, (err, res) => {
        if (err) return callback(err);
        const dbToken = res.rows[0];
        return callback(null, Token.fromObj(dbToken));
    });
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

TokenModel.invalidateBelongingTokens = function (belongsTo, callback) {
    const sql = `DELETE FROM ${table} WHERE belongsTo=$1 RETURNING *`;

    dbManager.query(sql, [belongsTo], (err, res) => {
        if (err) return callback(err);
        const tokens = res.rows.map(row => Token.fromObj(row));
        return callback(null, tokens);
    });
};

module.exports = TokenModel;