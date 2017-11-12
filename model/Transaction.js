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

function fromRows(rows = []) {
    return rows.map(fromObj);
}

/* istanbul ignore next */
Transaction.insert = function (transObj, callback) {
    const { id, currency, value, appusr, trip, done } = fromObj(transObj);
    const sql = `INSERT INTO ${table}(id, currency, value, appusr, trip, done) VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [id, currency, value, appusr, trip, done];
    dbManager.queryPromise(sql, values)
        .then(([dbTransaction]) => callback(null, fromObj(dbTransaction)))
        .catch(err => callback(err));
};

/* istanbul ignore next */
Transaction.findByUser = function (user, callback) {
    const userId = user.id || user;
    const sql = `SELECT * FROM ${table} WHERE appusr=$1`;
    const values = [userId];
    dbManager.queryPromise(sql, values)
        .then(rows => callback(null, fromRows(rows)))
        .catch(callback);
};

/* istanbul ignore next */
Transaction.findByIdAndUser = function (id, user, callback) {
    const userId = user.id || user;
    const sql = `SELECT * FROM ${table} WHERE id=$1 AND appusr=$2`;
    const values = [id, userId];
    dbManager.queryPromise(sql, values)
        .then(([tx]) => callback(null, fromObj(tx)))
        .catch(callback);
};

/**
 * Resuelve un pago pendiente.
 * @param {string} localTx Id de transaccion local.
 * @param {string} newTx Id de transaccion nueva (proveniente del PAYMENT API).
 * @param {function} callback Funcion a invocar cuando se resuelve la transaccion
 */
/* istanbul ignore next */
Transaction.solve = function (localTx, newTx, callback) {
    const localTxId = localTx.id || localTx;
    const newTxId = newTx.id || newTx;
    const sql = `UPDATE ${table} SET id=$1, done=$2 WHERE id=$3 RETURNING *`;
    const values = [newTxId, true, localTxId];
    dbManager.queryPromise(sql, values)
        .then(rows => callback(null, fromRows(rows)))
        .catch(callback);
};

module.exports = Transaction;