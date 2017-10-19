const dbManager = require('./db-manager');
const hasher = require('../utils/hasher');

const TABLE = 'rules';
exports.TABLE = TABLE;

const DEFAULT_LANGUAGE = 'node-rules/javascript';
exports.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;

/*
id SERIAL PRIMARY KEY, 
_ref VARCHAR(128) NOT NULL,
language VARCHAR(32) DEFAULT 'node-rules/javascript',
author ${BusinessUser.idType} REFERENCES ${BusinessUser.table}(id) ON DELETE SET NULL,
message VARCHAR(128),
timestamp TIMESTAMP DEFAULT now(),
blob JSON NOT NULL,
active BOOLEAN */
function Rule(id, _ref, language, lastCommit, blob, active = false) {
    this.id = id;
    this._ref = _ref;
    this.language = language || DEFAULT_LANGUAGE;
    this.lastCommit = lastCommit;
    this.blob = blob;
    this.active = active;
}

function hashRule(ruleObj) {
    const ruleRow = asRow(ruleObj);
    const { language, blob, active, author, message } = ruleRow;
    return hasher.hash({ language, blob, active, author, message });
}

function fromObj(ruleObj) {
    if (!ruleObj) return null;
    const { id, _ref, language, blob, active, author, message, timestamp, lastCommit = { author, message, timestamp } } = ruleObj;
    return new Rule(id, _ref, language, lastCommit, blob, active);
}

/**
 * Aplana un objeto regla / lo convierte en una fila similar a la tabla de reglas.
 * @param {any} ruleObj Objeto regla.
 * @return {any} Objeto regla aplanado.
 */
function asRow(ruleObj) {
    let { id, _ref, language, blob, active, lastCommit = {}, author, message, timestamp } = ruleObj;
    author = author || lastCommit.author;
    message = message || lastCommit.message;
    timestamp = timestamp || lastCommit.timestamp;
    return { id, _ref, language, blob, active, author, message, timestamp };
}

function insert(ruleObj, callback) {
    const ruleRow = asRow(ruleObj);
    const { language = DEFAULT_LANGUAGE, blob, active = true, author, message = '' } = ruleRow;
    const _ref = hashRule(ruleRow);

    const blobValue = typeof blob == 'string' ? blob : JSON.stringify(blob);
    const values = [_ref, language, blobValue, active, author, message];

    const sql = `INSERT INTO ${TABLE}(_ref, language, blob, active, author, message)
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;

    dbManager.queryPromise(sql, values)
        .then(([dbRule]) => callback(null, fromObj(dbRule)))
        .catch(err => callback(err));
}

exports.insert = insert;
