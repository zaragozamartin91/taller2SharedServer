const dbManager = require('./db-manager');

const table = 'balance';

function Balance(currency, value) {
    this.currency = currency;
    this.value = value;
}

Balance.table = table;

Balance.fromObj = function (obj) {
    if (!obj) return null;
    let { currency, value } = obj;
    return new Balance(currency, value);
};

Balance.fromRows = function (rows) {
    rows = rows || [];
    return rows.map(Balance.fromObj);
};

Balance.findByUser = function (userId, callback) {
    const sql = `SELECT currency,value FROM ${table} WHERE user=$1`;
    dbManager.query(sql, [userId], (err, res) => callback(err, Balance.fromRows(res.rows)));
};

module.exports = Balance;