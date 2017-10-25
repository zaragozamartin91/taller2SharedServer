const dbManager = require('./db-manager');

function Transaction(id, currency, value, date, appusr, trip, done = true) {
    this.id = id;
    this.currency = currency;
    this.value = value;
    this.date = date;
    this.appusr = appusr;
    this.trip = trip;
    this.done = done;
}

const table = 'transactions';
Transaction.table = table;

function fromObj(transObj) {
    if (!transObj) return null;
    const { id, currency, value, date, appusr, trip, done } = transObj;
    const usrId = appusr.id || appusr;
    const tripId = trip.id || trip;
    return new Transaction(id, currency, value, date, usrId, tripId, done);
}

Transaction.insert = function (transObj, callback) {
    const { id, currency, value, appusr, trip, done } = fromObj(transObj);
    const sql = `INSERT INTO ${table}(id, currency, value, appusr, trip, done) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [id, currency, value, appusr, trip, done];
    dbManager.queryPromise(sql, values)
        .then(([dbTransaction]) => callback(null, fromObj(dbTransaction)))
        .catch(err => callback(err));
};

module.exports = Transaction;