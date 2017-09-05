/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const encryptor = require('../utils/encryptor');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const Role = require('./Role');
const logger = require('log4js').getLogger('BusinessUser');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'business_user';
const rolesTable = 'bu_role';
const idType = 'VARCHAR(64)';
const defName = 'UNKNOWN';
const defSurname = 'UNKNOWN';
const EMPTY_FUNC = function () { };

/* CODIGO -------------------------------------------------------------------------------------- */

/**
 * Crea una instancia de usuario de negocio.
 * 
 * @constructor
 * @this {BusinessUser}
 * @param {string} id Idstring
 * @param {string} _ref Hash que es utilizado para prevenir colosiones.
 * @param {string} username 
 * @param {string} password 
 * @param {string} name 
 * @param {string} surname 
 * @return {BusinessUser}
 */
function BusinessUser(id, _ref, username, password, name, surname, roles) {
    this.id = id;
    this._ref = _ref || '';
    this.username = username;
    this.password = password;
    this.name = name || defName;
    this.surname = surname || defSurname;
}

BusinessUser.fromObj = function (usrObj) {
    if (usrObj) return new BusinessUser(
        usrObj.id, usrObj._ref, usrObj.username, usrObj.password,
        usrObj.name, usrObj.surname, usrObj.roles);
    else return null;
};

/* TODO: POR EL MOMENTO, NO SE GUARDARAN LOS ROLES */

BusinessUser.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        id ${idType} PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        name VARCHAR(32) DEFAULT '${defName}',
        surname VARCHAR(32) DEFAULT '${defSurname}'
    )`, [], callback);
};

BusinessUser.createRolesTable = function (callback) {
    dbManager.query(`CREATE TABLE ${rolesTable} (
        business_user ${idType} REFERENCES ${table}(id),
        role ${Role.idType} REFERENCES ${Role.table}(type),
        UNIQUE(business_user,role)
    )`, [], callback);
};

BusinessUser.deleteTable = function (callback) {
    dbManager.query(`DROP TABLE ${table}`, [], callback);
};

BusinessUser.insert = function (userObj, callback) {
    const username = userObj.username;
    const id = idGenerator.generateId(username);
    const password = encryptor.encrypt(userObj.password);
    const _ref = hasher.hash({ id, username });
    const name = userObj.name || defName;
    const surname = userObj.surname || defSurname;

    dbManager.query(`INSERT INTO ${table} 
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [id, _ref, username, password, name, surname], (err, res) => {
            if (err) return callback(err);
            callback(null, BusinessUser.fromObj(res.rows[0]));
        });
};

BusinessUser.findById = function (id, callback) {
    dbManager.query(`SELECT * FROM ${table} WHERE id=$1`,
        [id], (err, res) => {
            if (err) return callback(err);
            if (res.rows.length) return callback(null, BusinessUser.fromObj(res.rows[0]));
            callback(null, null);
        });
};

BusinessUser.find = function (callback) {
    dbManager.query(`SELECT * FROM ${table}`, [], (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows.map(BusinessUser.fromObj));
    });
};

BusinessUser.findByUsername = function (username, callback) {
    dbManager.query(`SELECT * FROM ${table} WHERE username=$1`, [username], (err, res) => {
        if (err) return callback(err);
        callback(null, BusinessUser.fromObj(res.rows[0]));
    });
};

BusinessUser.addRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = role.type || role.role || role;
    logger.debug(`Agregando rol ${roleId} al usuario ${userId}`);

    dbManager.query(`INSERT INTO ${rolesTable} VALUES($1,$2)`, [userId, roleId], callback);
};

BusinessUser.addRoles = function (user, roles, callback) {
    roles = roles || [];
    const functions = [];

    for (let index = 0; index < roles.length; index++) {
        const role = roles[index].type || roles[index];
        const prevFunction = functions[index - 1];
        /* Encadeno las funciones a llamar. La funcion en [0] sera la ultima en invocarse y
        eventualmente llamara al callback pasado por parametro. Cada funcion llamara eventualmente
        a la anterior. */
        if (index == 0) functions.push(() => BusinessUser.addRole(user, role, callback));
        else functions.push(() => BusinessUser.addRole(user, role, prevFunction));
    }

    const lastFunc = functions[functions.length - 1];
    if (lastFunc) lastFunc();
    else callback(null, user);
};

BusinessUser.hasRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = role.type || role.role || role;
    dbManager.query(`SELECT role FROM ${rolesTable} WHERE business_user=$1 AND role=$2`,
        [userId, roleId], (err, res) => {
            if (err) return callback(err);
            callback(null, res.rows.length > 0);
        });
};

BusinessUser.prototype.authenticate = function (password) {
    if (!password) throw new Error('No se indico un password para autenticar');
    const hash = this.password;
    return encryptor.verify(hash, password);
};

BusinessUser.prototype.hidePassword = function () {
    this.password = '****';
    return this;
};

BusinessUser.prototype.getRoles = function (callback) {
    dbManager.query(`SELECT role FROM ${rolesTable} WHERE business_user=$1`,
        [this.id], (err, res) => {
            if (err) return callback(err);
            const roles = res.rows.map(Role.fromObj);
            callback(null, roles);
        });
};

BusinessUser.prototype.addRole = function (role, callback) {
    role = role.type || role.role || role;
    BusinessUser.addRole(this.id, role, callback || EMPTY_FUNC);
};

BusinessUser.prototype.hasRole = function (role, callback) {
    return BusinessUser.hasRole(this, role);
};

BusinessUser.table = table;
BusinessUser.idType = idType;

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser('martin-1234', null, 'martin', encryptor.encrypt('pepe')),
];