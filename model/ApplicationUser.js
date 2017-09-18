const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const logger = require('log4js').getLogger('ApplicationUser');

const table = 'app_user';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';
const DEFAULT_BALANCE_CURR = 'PESOS';
const idType = 'VARCHAR(64)';
const DEFAULT_BALANCE = [{ currency: DEFAULT_BALANCE_CURR, value: 0.0 }];

function hashUser({ username, name, surname, country }) {
    return hasher.hash({ username, name, surname, country });
}

function ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, balance, cars) {
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
    this.balance = balance || DEFAULT_BALANCE;
}

ApplicationUser.table = table;
ApplicationUser.DEFAULT_NAME = DEFAULT_NAME;
ApplicationUser.DEFAULT_SURNAME = DEFAULT_SURNAME;
ApplicationUser.DEFAULT_BALANCE_CURR = DEFAULT_BALANCE_CURR;
ApplicationUser.idType = idType;

ApplicationUser.fromObj = function (obj) {
    if (!obj) return null;
    let { id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, balance, cars } = obj;
    applicationOwner = applicationOwner || obj.applicationowner;
    return new ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, balance, cars);
};

ApplicationUser.insert = function (usrObj, callback) {
    const user = ApplicationUser.fromObj(usrObj);
    let { applicationOwner, username, name, surname, country, email, birthdate, type, images, balance, cars } = user;
    let id = idGenerator.generateId(username);
    let _ref = hashUser(user);
    const sql = `INSERT INTO ${table} VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
    const values = [id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, JSON.stringify(images), JSON.stringify(balance)];

    dbManager.query(sql, values, (err, res) => {
        if (err) logger.error(err);
        callback(err, ApplicationUser.fromObj(res.rows[0]));
    });
};

module.exports = ApplicationUser;