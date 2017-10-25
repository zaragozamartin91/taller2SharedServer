const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const Car = require('./Car');
const logger = require('log4js').getLogger('ApplicationUser');
const flow = require('nimble');

const table = 'app_users';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';
const DEFAULT_BALANCE_CURR = 'ARS';
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
        let { carid, car_ref, carproperties } = row; // el nombre de la columna es carproperties, NO carProperties
        if (carid) user.cars.push(new Car(carid, car_ref, userId, carproperties));
        users[userId] = user;
    });
    return Object.keys(users).map(userId => users[userId]);
}

ApplicationUser.fromRows = fromRows;

// TODO : GUARDAR EL PASSWORD ENCRIPTADO
/* istanbul ignore next */
ApplicationUser.insert = function (usrObj, callback) {
    const user = fromObj(usrObj);
    let { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance, fb } = user;
    let id = idGenerator.generateApplicationUserId(applicationOwner, username);
    let _ref = hashUser(user);
    const sql = `INSERT INTO ${table} VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`;
    const values = [id, _ref, applicationOwner, username, password, name, surname, country, email, birthdate,
        type, JSON.stringify(images), JSON.stringify(balance), JSON.stringify(fb)];

    dbManager.query(sql, values, (err, res) => {
        if (err) logger.error(err);
        callback(err, fromObj(res.rows[0]));
    });
};

/**
 * Construye la base de la query de busqueda para usuarios de aplicacion.
 * @param {string} whereClause Sentencia where.
 * @return {string} Sql a invocar en una query.
 */
/* istanbul ignore next */
function buildFindQuery(whereClause) {
    whereClause = whereClause || '';
    const sql = `select u.*,${carTable}.id as carid, ${carTable}._ref as car_ref,${carTable}.properties as carproperties 
    from ${table} as u 
    left outer join ${carTable} on (u.id=${carTable}.owner)`;
    return `${sql} ${whereClause}`;
}

/* istanbul ignore next */
ApplicationUser.find = function (callback) {
    const sql = buildFindQuery();
    dbManager.query(sql, [], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows));
    });
};

/* istanbul ignore next */
ApplicationUser.findById = function (user, callback) {
    const userId = user.id || user;
    const sql = buildFindQuery('where u.id=$1');
    dbManager.query(sql, [userId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows)[0]);
    });
};

/* istanbul ignore next */
ApplicationUser.findByApp = function (app, callback) {
    const appId = app.id || app;
    const sql = buildFindQuery('where u.applicationowner=$1');
    dbManager.query(sql, [appId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows));
    });
};

/* istanbul ignore next */
ApplicationUser.findByIdAndApp = function (user, app, callback) {
    const userId = user.id || user;
    const appId = app.id || app;
    const sql = buildFindQuery('where u.applicationowner=$1 AND u.id=$2');
    dbManager.query(sql, [appId, userId], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows)[0]);
    });
};

/* istanbul ignore next */
ApplicationUser.delete = function (user, callback) {
    const userId = user.id || user;
    const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
    dbManager.query(sql, [userId], (err, { rows }) => callback(err, fromObj(rows[0])));
};

/* istanbul ignore next */
ApplicationUser.findByUsernameAndApp = function (user, app, callback) {
    const username = user.username || user;
    const appId = app.id || app;
    const sql = buildFindQuery('where u.applicationowner=$1 AND u.username=$2');
    dbManager.query(sql, [appId, username], (err, { rows }) => {
        if (err) console.error(err);
        callback(err, fromRows(rows)[0]);
    });
};

ApplicationUser.findByFbToken = function (fbtoken, app, callback) {
    const sql = buildFindQuery('WHERE u.applicationowner=$1');
    dbManager.queryPromise(sql, [app])
        .then(rows => {
            const users = fromRows(rows);
            const user = users.find(user => user.fb.authToken == fbtoken);
            callback(null, user);
        }).catch(callback);
};

/* Disminuye el saldo del usuario */
ApplicationUser.pay = function (user, cost, callback) {
    const userId = user.id || user;
    ApplicationUser.findById(userId, (err, dbUser) => {
        if (err) return callback(err);
        const specBalance = dbUser.balance.find(bal => bal.currency.toLowerCase() == cost.currency.toLowerCase());
        if (!specBalance) return callback(new Error(`El usuario ${userId} no tiene balance ${cost.currency}`));
        specBalance.value = specBalance.value - cost.value;

        const sql = `UPDATE ${table} SET balance=$1 WHERE id=$2 RETURNING *`;
        const values = [JSON.stringify(dbUser.balance), userId];
        dbManager.queryPromise(sql, values)
            .then(([upUsr]) => callback(null, fromObj(upUsr)))
            .catch(cause => callback(cause));
    });
};

/* Incrementa el saldo del usuario */
ApplicationUser.earn = function (user, { currency, value }, callback) {
    ApplicationUser.pay(user, { currency, value: -value }, callback);
};

ApplicationUser.prototype.validate = function (password, fbToken) {
    if (password) return password == this.password;
    const authToken = this.fb.authToken;
    return authToken && fbToken == authToken;
};

ApplicationUser.prototype.update = function (callback) {
    const user = this;
    const newRef = hashUser(user);

    const sql = `UPDATE ${table} SET type=$1, username=$2, password=$3, fb=$4, name=$5, 
        surname=$6, country=$7, email=$8, birthdate=$9, images=$10, _ref=$11, balance=$12 WHERE id=$13 RETURNING *`;
    const { type, username, password, fb, name, surname, country, email, birthdate, images, id, balance } = user;
    const values = [type, username, password, JSON.stringify(fb), name, surname, country, email, birthdate, JSON.stringify(images), newRef, JSON.stringify(balance), id];

    dbManager.query(sql, values, err => {
        /* Si no hay error, actualizo el valor de _ref */
        if (!err) user._ref = newRef;
        callback(err, user);
    });
};

ApplicationUser.prototype.isPassenger = function () {
    const usrType = this.type || '';
    return usrType.toLowerCase() == 'passenger';
};

ApplicationUser.prototype.isDriver = function () {
    const usrType = this.type || '';
    return usrType.toLowerCase() == 'driver';
};

ApplicationUser.prototype.delete = function (callback) {
    ApplicationUser.delete(this.id, callback);
};

ApplicationUser.prototype.getBalance = function (currency = '') {
    const balance = this.balance.find(bal => bal.currency.toLowerCase() == currency.toLowerCase());
    if (balance) return balance;
    console.log(`El usuario ${this.id} no tiene balance ${currency}`);
    return DEFAULT_BALANCE;
};

module.exports = ApplicationUser;