const dbManager = require('./db-manager');
const hasher = require('../utils/hasher');
const logger = require('log4js').getLogger('Car');

const table = 'car';
const idType = 'VARCHAR(64)';
const DEFAULT_PROPERTIES = [];

function hashCar({ owner, properties }) {
    return hasher.hash({ owner, properties });
}

function Car(id, _ref, owner, properties) {
    this.id = id;
    this._ref = _ref;
    this.owner = owner;
    this.properties = properties || DEFAULT_PROPERTIES;
}

Car.table = table;
Car.idType = idType;

Car.fromObj = function (obj) {
    if (!obj) return null;
    let { id, _ref, owner, properties } = obj;
    return new Car(id, _ref, owner, properties);
};

Car.fromRows = function (rows) {
    return rows.map(Car.fromObj);
};

Car.insert = function (carObj, callback) {
    const car = Car.fromObj(carObj);
    let { owner, properties } = car;
    let _ref = hashCar(car);

    const values = [_ref, owner, JSON.stringify(properties)];
    const sql = `INSERT INTO ${table}(_ref, owner, properties) VALUES($1,$2,$3) RETURNING *`;
    dbManager.query(sql, values, (err, { rows }) => {
        if (err) logger.error(err);
        callback(err, Car.fromObj(rows[0]));
    });
};

Car.findByOwner = function (owner, callback) {
    const ownerId = owner.id || owner;
    const sql = `SELECT * FROM ${table} WHERE owner=$1`;
    dbManager.query(sql, [ownerId], (err, { rows }) => callback(err, Car.fromRows(rows)));
};

module.exports = Car;