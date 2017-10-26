const dbManager = require('./db-manager');

/* FIN DE IMPORTS ----------------------------------------------------------------------------------------------------------------------------- */

const TABLE = 'trips';
const DEFAULT_ENDPOINT = {
    address: { street: '', location: { lat: 0, lon: 0 } },
    timestamp: 0
};
const DEFAULT_COST = {
    currency: '',
    value: 0
};
const DEFAULT_ROUTE = [{
    location: { lat: 0, lon: 0 },
    timestamp: 0
}];

/* FIN DE CONSTANTES ----------------------------------------------------------------------------------------------------------------------------- */

function Trip(id, applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, date) {
    this.id = id;
    this.applicationOwner = applicationOwner;
    this.driver = driver;
    this.passenger = passenger;
    this.start = start || DEFAULT_ENDPOINT;
    this.end = end || DEFAULT_ENDPOINT;
    this.totalTime = totalTime;
    this.waitTime = waitTime;
    this.travelTime = travelTime;
    this.distance = distance;
    this.route = route || DEFAULT_ROUTE;
    this.cost = cost || DEFAULT_COST;
    this.date = date || new Date();
}

Trip.TABLE = TABLE;

const idType = 'INTEGER';
Trip.idType = idType;

function fromObj(tripObj) {
    if (!tripObj) return null;

    /* EN LA TABLA DE VIAJES, LOS NOMBRES DE CAMPOS start Y end SON INVALIDOS POR LO CUAL SE REEMPLAZAN POR _start Y _end */
    /* EN LA TABLA LOS NOMBRES DE COLUMNAS NO SON camelCase POR LO CUAL SE INTENTAN CAPTURAR LOS NOMRBES REGULARES */
    const { id, applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, date,
        _start, _end, applicationowner, totaltime, waittime, traveltime } = tripObj;

    return new Trip(id, applicationOwner || applicationowner, driver, passenger, start || _start, end || _end, totalTime || totaltime,
        waitTime || waittime, travelTime || traveltime, distance, route, cost, date);
}

Trip.fromObj = fromObj;

function fromRows(rows = []) {
    return rows.map(fromObj);
}

Trip.fromRows = fromRows;

Trip.insert = function (tripObj, callback) {
    const trip = fromObj(tripObj);
    const { applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost } = trip;
    const sql = `INSERT INTO ${TABLE}(applicationOwner, driver, passenger, _start, _end, totalTime, waitTime, travelTime, distance, route, cost)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`;
    const values = [applicationOwner, driver, passenger, JSON.stringify(start), JSON.stringify(end), totalTime,
        waitTime, travelTime, distance, JSON.stringify(route), JSON.stringify(cost)];

    dbManager.queryPromise(sql, values)
        .then(rows => callback(null, fromObj(rows[0])))
        .catch(cause => callback(cause));
};

Trip.find = function (callback) {
    const sql = `SELECT * FROM ${TABLE}`;
    dbManager.queryPromise(sql, [])
        .then(rows => callback(null, fromRows(rows)))
        .catch(cause => callback(cause));
};

Trip.findByUser = function (user, callback) {
    const userId = user.id || user;
    const sql = `SELECT * FROM ${TABLE} WHERE driver=$1 OR passenger=$1`;
    dbManager.queryPromise(sql, [userId])
        .then(rows => callback(null, fromRows(rows)))
        .catch(cause => callback(cause));
};

Trip.findById = function (trip, callback) {
    const tripId = trip.id || trip;
    const sql = `SELECT * FROM ${TABLE} WHERE id=$1`;
    dbManager.queryPromise(sql, [tripId])
        .then(([tripRow]) => callback(null, fromObj(tripRow)))
        .catch(cause => callback(cause));
};

Trip.delete = function (trip, callback) {
    const tripId = trip.id || trip;
    const sql = `DELETE FROM ${TABLE} WHERE id=$1 RETURNING *`;
    dbManager.queryPromise(sql, [tripId])
        .then(([tripRow]) => callback(null, fromObj(tripRow)))
        .catch(cause => callback(cause));
};

Trip.findByServer = function (trip, callback) {
    const tripId = trip.id || trip;
    const sql = `SELECT * FROM ${TABLE} WHERE applicationowner=$1`;
    dbManager.queryPromise(sql, [tripId])
        .then(rows => callback(null, fromRows(rows)))
        .catch(cause => callback(cause));
};

module.exports = Trip;