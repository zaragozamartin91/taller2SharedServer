const dbManager = require('./db-manager');
const hasher = require('../utils/hasher');
const RuleCommit = require('./RuleCommit');

const TABLE = 'rules';


const DEFAULT_LANGUAGE = 'node-rules/javascript';
const DEFAULT_PRIORITY = 999;


/**
 * Regla de negocio
 * @param {number} id Identificador unico.
 * @param {string} _ref Referencia para ediciones para prevenir colisiones.
 * @param {string} language Lenguaje de la regla.
 * @param {date} lastCommit Ultima fecha de modificacion.
 * @param {object} blob Especificacion de la regla.
 * @param {boolean} active Activa o no.
 * @param {number} priority Prioridad de la regla. Mas bajo es mas importante.
 */
function Rule(id, _ref, language, lastCommit, blob, active = false, priority = DEFAULT_PRIORITY) {
    this.id = id;
    this._ref = _ref;
    this.language = language || DEFAULT_LANGUAGE;
    this.lastCommit = lastCommit;
    this.blob = blob;
    this.active = active;
    this.priority = priority;
}

Rule.TABLE = TABLE;
Rule.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;
Rule.DEFAULT_PRIORITY = DEFAULT_PRIORITY;

function hashRule(ruleObj) {
    const { language, blob, active } = ruleObj;
    return hasher.hash({ language, blob, active });
}

function fromObj(ruleObj) {
    if (!ruleObj) return null;
    const { id, _ref, language, blob, active, author = '', message = '',
        timestamp = new Date(), lastCommit = { author, message, timestamp }, priority = DEFAULT_PRIORITY } = ruleObj;
    return new Rule(id, _ref, language, lastCommit, blob, active, priority);
}

function fromRows(rows = []) {
    return rows.map(fromObj);
}

/* istanbul ignore next */
Rule.insert = function (ruleObj, callback) {
    const { language = DEFAULT_LANGUAGE, blob, active = true, author, message = '', priority = DEFAULT_PRIORITY } = ruleObj;
    const _ref = hashRule(ruleObj);

    const blobValue = typeof blob == 'string' ? blob : JSON.stringify(blob);
    const values = [_ref, language, blobValue, active, priority];

    const sql = `INSERT INTO ${TABLE}(_ref, language, blob, active, priority)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`;

    let dbRule;
    dbManager.queryPromise(sql, values)
        .then(([rule]) => {
            dbRule = rule;

            /* Inserto el commit de la regla */
            const commitObj = { rule, author, message, blob, active };
            return new Promise((resolve, reject) =>
                RuleCommit.insert(commitObj, (err, dbCommit) => err ? reject(err) : resolve(dbCommit)));
        })
        .then(commit => {
            dbRule.lastCommit = { author, message, timestamp: commit.timestamp };
            callback(null, fromObj(dbRule));
        })
        .catch(callback);
};

/* istanbul ignore next */
Rule.findActive = function (callback) {
    const sql = `SELECT * FROM ${TABLE} WHERE active=$1 ORDER BY priority , id ASC`;
    dbManager.queryPromise(sql, [true])
        .then(rules => callback(null, fromRows(rules)))
        .catch(callback);
};

/* istanbul ignore next */
Rule.findById = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `SELECT * FROM ${TABLE} WHERE id=$1`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(([dbRule]) => callback(null, fromObj(dbRule)))
        .catch(err => callback(err));
};

/* istanbul ignore next */
Rule.delete = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `DELETE FROM ${TABLE} WHERE id=$1 RETURNING *`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(([dbRule]) => callback(null, fromObj(dbRule)))
        .catch(err => callback(err));
};

/* istanbul ignore next */
Rule.update = function (rule, callback) {
    const newRef = hashRule(rule);
    const { id, language, blob, active, author, message, priority } = rule;
    const sql = `UPDATE ${TABLE} SET _ref=$1, language=$2, blob=$3, active=$4, priority=$5 WHERE id=$6 RETURNING *`;
    const values = [newRef, language, blob, active, priority, id];

    let dbRule;
    dbManager.queryPromise(sql, values)
        .then(([rule]) => {
            dbRule = rule;

            /* Inserto el commit de la regla */
            const commitObj = { rule, author, message, blob, active };
            return new Promise((resolve, reject) =>
                RuleCommit.insert(commitObj, (err, dbCommit) => err ? reject(err) : resolve(dbCommit)));
        })
        .then(commit => {
            dbRule.lastCommit = { author, message, timestamp: commit.timestamp };
            callback(null, fromObj(dbRule));
        })
        .catch(callback);
};

/* istanbul ignore next */
Rule.find = function (callback) {
    dbManager.queryPromise(`SELECT * FROM ${TABLE} ORDER BY priority , id ASC`, [])
        .then(rows => callback(null, fromRows(rows)))
        .catch(callback);
};

module.exports = Rule;