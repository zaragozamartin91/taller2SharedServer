const dbManager = require('./db-manager');
const ApplicationUser = require('./ApplicationUser');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const logger = require('log4js').getLogger('Car');

const table = 'car';
const idType = 'VARCHAR(64)';
const DEFAULT_PROPERTIES = [];

function hashCar({ owner, properties }) {
    return hasher.hash({ owner, properties: JSON.stringify(properties) });
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

Car.insert = function (carObj, callback) {
    const car = Car.fromObj(carObj);
    let { owner, properties } = car;
    let id = idGenerator.generateId(`${owner}-car`);
    let _ref = hashCar(car);
    const values = [id, _ref, owner, JSON.stringify(properties)];
    const sql = `INSERT INTO ${table} VALUES($1,$2,$3,$4)`;
    dbManager.query(sql, values, callback);
};

module.exports = Car;