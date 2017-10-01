const dbManager = require('./db-manager');
const hasher = require('../utils/hasher');
const logger = require('log4js').getLogger('Car');

const table = 'car';
const idType = 'VARCHAR(64)';
const DEFAULT_PROPERTIES = [];

function hashCar({ owner, properties }) {
    return hasher.hash({ owner, properties });
}

class Car {
    constructor(id, _ref, owner, properties = DEFAULT_PROPERTIES) {
        this.id = id;
        this._ref = _ref;
        this.owner = owner;
        this.properties = properties;
    }

    update(callback) {
        const carId = this.id;
        const newRef = hashCar(this);
        const sql = `UPDATE ${table} SET _ref=$1, properties=$2 WHERE id=$3 RETURNING *`;
        
        dbManager.query(sql,[newRef, JSON.stringify(this.properties), carId], (err,{rows}) => {
            if(err) return callback(err);
            this._ref = newRef;
            callback(null, this);
        });
    }

    delete(callback) {
        const carId = this.id;
        const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
        dbManager.query(sql, [carId], (err, { rows }) => callback(err, fromRows(rows)[0]));
    }
}

Car.table = table;
Car.idType = idType;

Car.fromObj = function (obj) {
    if (!obj) return null;
    let { id, _ref, owner, properties } = obj;
    return new Car(id, _ref, owner, properties);
};

function fromRows(rows) {
    return rows.map(Car.fromObj);
}

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
    dbManager.query(sql, [ownerId], (err, { rows }) => callback(err, fromRows(rows)));
};

module.exports = Car;