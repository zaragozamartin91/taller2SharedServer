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
const DEFAULT_PAYMETHOD = {
    'paymethod': '',
    'parameters': {}
};

/* FIN DE CONSTANTES ----------------------------------------------------------------------------------------------------------------------------- */

function Trip(id, applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, paymethod) {
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
    this.paymethod = paymethod || DEFAULT_PAYMETHOD;
}

Trip.TABLE = TABLE;

function fromObj(tripObj) {
    if (!tripObj) return null;

    const { id, applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, paymethod,
        applicationowner, totaltime, waittime, traveltime } = tripObj;

    return new Trip(id, applicationOwner || applicationowner, driver, passenger, start, end, totalTime || totaltime,
        waitTime || waittime, travelTime || traveltime, distance, route, cost, paymethod);
}

Trip.fromObj = fromObj;

function fromRows(rows = []) {
    return rows.map(fromObj);
}

Trip.fromRows = fromRows;

Trip.insert = function (tripObj, callback) {
    const trip = fromObj(tripObj);
    const { applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, paymethod } = trip;
    const sql = `INSERT INTO ${TABLE}(applicationOwner, driver, passenger, start, end, totalTime, waitTime, travelTime, distance, route, cost, paymethod)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
    const values = [applicationOwner, driver, passenger, JSON.stringify(start), JSON.stringify(end), totalTime,
        waitTime, travelTime, distance, JSON.stringify(route), JSON.stringify(cost), JSON.stringify(paymethod)];

    dbManager.queryPromise(sql, values)
        .then(rows => callback(null, fromObj(rows[0])))
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
        .then(rows => callback(null, fromRows(rows)))
        .catch(cause => callback(cause));
};

module.exports = Trip;