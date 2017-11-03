const dbManager = require('./db-manager');
const hasher = require('../utils/hasher');
const RuleCommit = require('./RuleCommit');

const TABLE = 'rules';


const DEFAULT_LANGUAGE = 'node-rules/javascript';


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

Rule.TABLE = TABLE;
Rule.DEFAULT_LANGUAGE = DEFAULT_LANGUAGE;

function hashRule(ruleObj) {
    const { language, blob, active } = ruleObj;
    return hasher.hash({ language, blob, active });
}

function fromObj(ruleObj) {
    if (!ruleObj) return null;
    const { id, _ref, language, blob, active, author = '', message = '',
        timestamp = new Date(), lastCommit = { author, message, timestamp } } = ruleObj;
    return new Rule(id, _ref, language, lastCommit, blob, active);
}

function fromRows(rows = []) {
    return rows.map(fromObj);
}


Rule.insert = function (ruleObj, callback) {
    const { language = DEFAULT_LANGUAGE, blob, active = true, author, message = '' } = ruleObj;
    const _ref = hashRule(ruleObj);

    const blobValue = typeof blob == 'string' ? blob : JSON.stringify(blob);
    const values = [_ref, language, blobValue, active];

    const sql = `INSERT INTO ${TABLE}(_ref, language, blob, active)
        VALUES ($1,$2,$3,$4) RETURNING *`;

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

Rule.findActive = function (callback) {
    const sql = `SELECT * FROM ${TABLE} WHERE active=$1 ORDER BY id ASC`;
    dbManager.queryPromise(sql, [true])
        .then(rules => callback(null, fromRows(rules)))
        .catch(callback);
};

Rule.findById = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `SELECT * FROM ${TABLE} WHERE id=$1`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(([dbRule]) => callback(null, fromObj(dbRule)))
        .catch(err => callback(err));
};


Rule.delete = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `DELETE FROM ${TABLE} WHERE id=$1 RETURNING *`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(([dbRule]) => callback(null, fromObj(dbRule)))
        .catch(err => callback(err));
};

Rule.update = function (rule, callback) {
    const newRef = hashRule(rule);
    const { id, language, blob, active, author, message } = rule;
    const sql = `UPDATE ${TABLE} SET _ref=$1, language=$2, blob=$3, active=$4 WHERE id=$5 RETURNING *`;
    const values = [newRef, language, blob, active, id];

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

module.exports = Rule;