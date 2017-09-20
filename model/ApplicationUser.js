const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const Car = require('./Car');
const logger = require('log4js').getLogger('ApplicationUser');
const flow = require('nimble');

const table = 'app_user';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';
const DEFAULT_BALANCE_CURR = 'PESOS';
const idType = 'VARCHAR(64)';
const DEFAULT_BALANCE = [{ currency: DEFAULT_BALANCE_CURR, value: 0.0 }];
const carTable = Car.table;

function hashUser({ username, name, surname, country }) {
    return hasher.hash({ username, name, surname, country });
}

function ApplicationUser(id, _ref, applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance, fb, cars) {
    this.id = id;
    this._ref = _ref;
    this.applicationOwner = applicationOwner;
    this.type = type;
    this.username = username;
    this.password = password;
    this.name = name || DEFAULT_NAME;
    this.surname = surname || DEFAULT_SURNAME;
    this.country = country;
    this.email = email;
    this.birthdate = birthdate;
    this.images = images || [];
    this.balance = balance || DEFAULT_BALANCE;
    this.fb = fb || {};
    this.cars = cars || [];
}

ApplicationUser.table = table;
ApplicationUser.DEFAULT_NAME = DEFAULT_NAME;
ApplicationUser.DEFAULT_SURNAME = DEFAULT_SURNAME;
ApplicationUser.DEFAULT_BALANCE_CURR = DEFAULT_BALANCE_CURR;
ApplicationUser.idType = idType;

/**
 * Crea un usuario a partir de un objeto.
 * @param {object} obj Objeto a partir del cual crear el usuario.
 */
function fromObj(obj) {
    if (!obj) return null;
    let { id, _ref, applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance, fb, cars } = obj;
    applicationOwner = applicationOwner || obj.applicationowner;
    return new ApplicationUser(id, _ref, applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance, fb, cars);
}

ApplicationUser.fromObj = fromObj;

/**
 * Obtiene un arreglo de usuarios a partir de un arreglo de filas de query de usuarios.
 * @param {Array} rows Filas.
 * @return {Array<ApplicationUser>} Arreglo de usuarios.
 */
function fromRows(rows) {
    const users = {};
    rows.forEach(row => {
        const userId = row.id;
        const user = users[userId] || fromObj(row);
        let { carid, car_ref, carproperties } = row;
        if (carid) user.cars.push(new Car(carid, car_ref, userId, carproperties));
        users[userId] = user;
    });
    return Object.keys(users).map(userId => users[userId]);
}

ApplicationUser.fromRows = fromRows;

// TODO : GUARDAR EL PASSWORD ENCRIPTADO
ApplicationUser.insert = function (usrObj, callback) {
    const user = fromObj(usrObj);
    let { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance, fb } = user;
    let id = idGenerator.generateId(username);
    let _ref = hashUser(user);
    const sql = `INSERT INTO ${table} VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`;
    const values = [id, _ref, applicationOwner, username, password, name, surname, country, email, birthdate,
        type, JSON.stringify(images), JSON.stringify(balance), JSON.stringify(fb)];

    dbManager.query(sql, values, (err, res) => {
        if (err) logger.error(err);
        callback(err, fromObj(res.rows[0]));
    });
};

ApplicationUser.find = function (callback) {
    const sql = `select u.*,${carTable}.id as carid, ${carTable}._ref as car_ref,${carTable}.properties as carproperties 
    from ${table} as u 
    left outer join ${carTable} on (u.id=${carTable}.owner)`;
    dbManager.query(sql, [], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows));
    });
};

ApplicationUser.findById = function (user, callback) {
    const userId = user.id || user;
    const sql = `select u.*,${carTable}.id as carid, ${carTable}._ref as car_ref,${carTable}.properties as carproperties 
    from ${table} as u 
    left outer join ${carTable} on (u.id=${carTable}.owner)
    where u.id=$1`;
    dbManager.query(sql, [userId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows)[0]);
    });
};

ApplicationUser.findByApp = function (app, callback) {
    const appId = app.id || app;
    const sql = `select u.*,${carTable}.id as carid, ${carTable}._ref as car_ref,${carTable}.properties as carproperties 
    from ${table} as u 
    left outer join ${carTable} on (u.id=${carTable}.owner)
    where u.applicationowner=$1`;
    dbManager.query(sql, [appId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows));
    });
};

ApplicationUser.findByIdAndApp = function (user, app, callback) {
    const userId = user.id || user;
    const appId = app.id || app;
    const sql = `select u.*,${carTable}.id as carid, ${carTable}._ref as car_ref,${carTable}.properties as carproperties 
    from ${table} as u 
    left outer join ${carTable} on (u.id=${carTable}.owner)
    where u.applicationowner=$1 AND u.id=$2`;
    dbManager.query(sql, [appId, userId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromObj(rows[0]));
    });
};

ApplicationUser.delete = function (user, callback) {
    const userId = user.id || user;
    const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
    dbManager.query(sql, [userId], (err, { rows }) => callback(err, fromObj(rows[0])));
};

module.exports = ApplicationUser;