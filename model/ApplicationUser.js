const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');
const logger = require('log4js').getLogger('ApplicationUser');

const table = 'app_user';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';
const DEFAULT_BALANCE_CURR = 'PESOS';
const idType = 'VARCHAR(64)';

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

ApplicationUser.table = table;
ApplicationUser.DEFAULT_NAME = DEFAULT_NAME;
ApplicationUser.DEFAULT_SURNAME = DEFAULT_SURNAME;
ApplicationUser.DEFAULT_BALANCE_CURR = DEFAULT_BALANCE_CURR;
ApplicationUser.idType = idType;

ApplicationUser.fromObj = function (obj) {
    if (!obj) return null;
    let { id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balance } = obj;
    applicationOwner = applicationOwner || obj.applicationowner;
    return new ApplicationUser(id, _ref, applicationOwner, username, name, surname, country, email, birthdate, type, images, cars, balance);
};

module.exports = ApplicationUser;