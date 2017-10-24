const dbManager = require('./db-manager');

function Transaction(id, currency, value, date) {
    this.id = id;
    this.currency = currency;
    this.value = value;
    this.date = date;
}

const table = 'transactions';
Transaction.table = table;

function fromObj(transObj) {
    if (!transObj) return null;
    const { id, currency, value, date } = transObj;
    return new Transaction(id, currency, value, date);
}

Transaction.insert = function (transObj, callback) {
    const { id, currency, value } = transObj;
    const sql = `INSERT INTO ${table}(id, currency, value) VALUES($1,$2,$3) RETURNING *`;
    const values = [id, currency, value];
    dbManager.queryPromise(sql, values)
        .then(([dbTransaction]) => callback(null, fromObj(dbTransaction)))
        .catch(err => callback(err));
};

