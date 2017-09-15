const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');
const logger = require('log4js').getLogger('ApplicationUser');

const table = 'app_user';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';
const DEFAULT_BALANCE_CURR = 'PESOS';

function ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balance) {
    this.id = id;
    this._ref = _ref;
    this.applicationOwner = applicationOwner;
    this.type = type;
    this.cars = cars || [];
    this.username = username;
    this.name = name || DEFAULT_NAME;
    this.surname = surname || DEFAULT_SURNAME;
    this.country = country;
    this.email = email;
    this.birthdate = birthdate;
    this.images = images || [];
    this.balance = balance || { currency: DEFAULT_BALANCE_CURR, value: 0.0 };
}

ApplicationUser.fromObj = function (obj) {
    if (!obj) return null;
    let { id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balance } = obj;
    applicationOwner = applicationOwner || obj.applicationowner;
    return new ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balance);
};

ApplicationUser.fromRow = function (obj) {
    if (!obj) return null;
    let { id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balanceval, balancecurr } = obj;
    applicationOwner = applicationOwner || obj.applicationowner;
    return new ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, { value: balanceval, currency: balancecurr });
};

ApplicationUser.createTable = function (callback) {
    const sql = `CREATE TABLE ${table} (
        id VARCHAR(64) PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        applicationOwner ${ApplicationServer.idType} REFERENCES ${ApplicationServer.table}(id) ON DELETE CASCADE, 
        username VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(32) DEFAULT '${DEFAULT_NAME}',
        surname VARCHAR(32) DEFAULT '${DEFAULT_SURNAME}',
        country VARCHAR(32),
        email VARCHAR(64),
        birthdate TIMESTAMP,
        type VARCHAR(16),
        balanceval DECIMAL(9,2),
        balancecurr VARCHAR(16) DEFAULT '${DEFAULT_BALANCE_CURR}'
    )`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

ApplicationUser.dropTable = function (callback) {
    const sql = `DROP TABLE ${table}`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

