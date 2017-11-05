const dbManager = require('./db-manager');

function RuleCommit(id, rule, author, message, timestamp, blob, active) {
    this.id = id;
    this.rule = rule;
    this.author = author;
    this.message = message;
    this.timestamp = timestamp;
    this.blob = blob;
    this.active = active;
}

const table = 'rule_commits';
RuleCommit.table = table;

function fromObj(obj) {
    if (!obj) return null;
    const { id, rule, author, message, timestamp, blob, active } = obj;
    return new RuleCommit(id, rule, author, message, timestamp, blob, active);
}

function fromRows(rows = []) {
    return rows.map(fromObj);
}

/* istanbul ignore next */
RuleCommit.insert = function (commit, callback) {
    const { rule, author, message, blob, active } = commit;
    const ruleId = rule.id || rule;
    const sql = `INSERT INTO ${table}(rule, author, message, blob, active) VALUES($1,$2,$3,$4,$5) RETURNING *`;
    const values = [ruleId, author, message, JSON.stringify(blob), active];
    dbManager.queryPromise(sql, values)
        .then(([dbCommit]) => callback(null, fromObj(dbCommit)))
        .catch(callback);
};

/* istanbul ignore next */
RuleCommit.findByRule = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `SELECT * FROM ${table} WHERE rule=$1`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(rows => callback(null, fromRows(rows)))
        .catch(callback);
};

/* istanbul ignore next */
RuleCommit.findLastByRule = function (rule, callback) {
    const ruleId = rule.id || rule;
    const sql = `SELECT * FROM ${table} WHERE rule=$1 ORDER BY id DESC LIMIT 1`;
    const values = [ruleId];
    dbManager.queryPromise(sql, values)
        .then(([dbCommit]) => callback(null, fromObj(dbCommit)))
        .catch(callback);
};

/* istanbul ignore next */
RuleCommit.findById = function (commit, callback) {
    const commitId = commit.id || commit;
    const sql = `SELECT * FROM ${table} WHERE id=$1`;
    const values = [commitId];
    dbManager.queryPromise(sql, values)
        .then(([dbCommit]) => callback(null, fromObj(dbCommit)))
        .catch(callback);
};

module.exports = RuleCommit;