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

function hashUser(id, username, name, surname, password) {
    return hasher.hash({ id, username, name, surname, password });
}

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
 * @param {Array<Role>} roles 
 * @return {BusinessUser}
 */
function BusinessUser(id, _ref, username, password, name, surname, roles) {
    this.id = id;
    this._ref = _ref || '';
    this.username = username;
    this.password = password;
    this.name = name || defName;
    this.surname = surname || defSurname;
    this.roles = roles || [];
}

/**
 * Crea un usuario de negocio a partir de un objeto.
 * @param {object} usrObj Objeto a partir del cual crear el usuario.
 * @return {BusinessUser} Nuevo usuario de negocio.
 */
BusinessUser.fromObj = function (usrObj) {
    if (!usrObj) return null;
    return new BusinessUser(usrObj.id, usrObj._ref, usrObj.username,
        usrObj.password, usrObj.name, usrObj.surname, usrObj.roles);
};

/**
 * Construye un conjunto de usuarios a partir de un resultado de query.
 * @param {Array} rows Filas resultado de una query en la BBDD.
 * @return {Array<User>} Usuarios.
 */
function buildUsersFromRows(rows) {
    const users = {};
    rows.forEach(row => {
        const userId = row.id;
        const role = row.role;
        const user = users[userId] || BusinessUser.fromObj(row);

        if (role) user.roles.push(Role.fromObj(role));
        users[userId] = user;
    });

    return Object.keys(users).map(userId => users[userId]);
}

/**
 * Crea la tabla de usuarios de negocio.
 * @param {Function} callback Funcion a invocar luego de crear la tabla.
 */
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

/**
 * Crea la tabla de roles de usuario de negocio.
 * @param {Function} callback Funcion a invocar luego que la tabla fue creada.
 */
BusinessUser.createRolesTable = function (callback) {
    dbManager.query(`CREATE TABLE ${rolesTable} (
        business_user ${idType} REFERENCES ${table}(id),
        role ${Role.idType} REFERENCES ${Role.table}(type),
        UNIQUE(business_user,role)
    )`, [], callback);
};

/**
 * Inserta un usuario de negocio en la BBDD.
 * @param {object} userObj Objeto a partir del cual crear el usuario.
 * @param {Function} callback Funcion a llamar luego de insertar el usuario.
 */
BusinessUser.insert = function (userObj, callback) {
    const username = userObj.username;
    const id = idGenerator.generateId(username);
    const password = encryptor.encrypt(userObj.password);
    const name = userObj.name || defName;
    const surname = userObj.surname || defSurname;
    const _ref = hashUser(id, username, name, surname, password);
    const roles = userObj.roles;

    dbManager.query(`INSERT INTO ${table} 
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [id, _ref, username, password, name, surname], (err, res) => {
            if (err) return callback(err);

            const rows = res.rows;
            if (!rows.length) return callback(null, null);

            logger.debug(`Usuario ${id} insertado`);
            const user = rows[0];
            BusinessUser.addRoles(user, roles, callback);
        });
};

/**
 * Obtiene un usuario de negocio a partir de su id.
 * @param {string} id Id del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
BusinessUser.findById = function (id, callback) {
    dbManager.query(
        `SELECT u.*,${rolesTable}.role FROM ${table} u LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table}) WHERE u.id=$1`,
        [id], (err, res) => {
            if (err) return callback(err);
            const rows = res.rows;
            if (rows.length) return callback(null, buildUsersFromRows(rows)[0]);
            callback(null, null);
        });
};

BusinessUser.find = function (callback) {
    dbManager.query(
        `SELECT u.*,${rolesTable}.role FROM ${table} u LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table})`,
        (err, res) => {
            if (err) return callback(err);
            const rows = res.rows;
            if (rows.length) return callback(null, buildUsersFromRows(rows));
            callback(null, []);
        });
};


/**
 * Obtiene un usuario de negocio a partir de su username.
 * @param {string} username username del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
BusinessUser.findByUsername = function (username, callback) {
    const sql = `SELECT u.*,${rolesTable}.role 
        FROM ${table} u LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table}) WHERE u.username=$1`;

    dbManager.query(sql, [username], (err, res) => {
        if (err) return callback(err);
        const rows = res.rows;
        if (rows.length) return callback(null, buildUsersFromRows(rows)[0]);
        callback(null, null);
    });
};

BusinessUser.addRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = role.type || role.role || role;
    logger.debug(`Agregando rol ${roleId} al usuario ${userId}`);

    dbManager.query(`INSERT INTO ${rolesTable} VALUES($1,$2)`, [userId, roleId], callback);
};

BusinessUser.removeRoles = function (user, roles, callback) {
    roles = Role.asStrings(roles);
    if (roles.length == 0) return callback(null, user);

    const userId = user.id || user;
    logger.debug(`Quitando roles ${roles} al usuario ${userId}`);

    let roleConstraints = `role='${roles[0]}'`;
    for (let index = 1; index < roles.length; index++) {
        roleConstraints += ` OR role='${roles[index]}'`;
    }

    const sql = `DELETE FROM ${rolesTable} WHERE ${table}=$1 AND (${roleConstraints})`;
    dbManager.query(sql, [userId], callback);
};

/**
 * Agrega un conjunto de roles a un usuario.
 * @param {BusinessUser} user Usuario al cual agregarle roles.
 * @param {Array<string>} roles Roles a agregar.
 * @param {Function} callback Funcion a invocar al finalizar (err,user) => {}.
 */
BusinessUser.addRoles = function (user, roles, callback) {
    roles = Role.asStrings(roles);
    const functions = [];

    const userId = user.id || user;
    logger.debug(`Agregando roles ${roles} al usuario ${userId}`);

    for (let index = 0; index < roles.length; index++) {
        const role = roles[index].type || roles[index];
        const prevFunction = functions[index - 1];
        /* Encadeno las funciones a llamar. La funcion en [0] sera la ultima en invocarse y
        eventualmente llamara al callback pasado por parametro. Cada funcion llamara eventualmente
        a la anterior. */
        if (index == 0) functions.push(e => BusinessUser.addRole(user, role, callback));
        else functions.push(e => BusinessUser.addRole(user, role, prevFunction));
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

BusinessUser.getRoles = function (user, callback) {
    const userId = user.id || user;
    dbManager.query(`SELECT role FROM ${rolesTable} WHERE business_user=$1`,

        [userId], (err, res) => {
            if (err) return callback(err);
            const roles = res.rows.map(Role.fromObj);
            callback(null, roles);
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

BusinessUser.prototype.hasRole = function (role, callback) {
    return BusinessUser.hasRole(this, role);
};

/**
 * Establece el password y lo encripta. Se debe llamar a este metodo para actualizar
 * el password de manera correcta.
 * @this {BusinessUser}
 * @param {string} password El password a encriptar y establecer.
 * @return {BusinessUser} this.
 */
BusinessUser.prototype.setPassword = function (password) {
    this.password = encryptor.encrypt(password);
    return this;
};


BusinessUser.prototype.update = function (callback) {
    logger.debug(`Actualizando usuario ${this.id}`);
    const newRef = hashUser(this.id, this.username, this.name, this.surname, this.password);

    dbManager.query(`SELECT * FROM ${table} WHERE id=$1 AND _ref=$2`,
        [this.id, newRef], (err, res) => {
            if (err) return callback(err);

            const user = res.rows[0];
            if (!user) return callback(new Error('Ocurrio una colision al actualizar!'));

            const newRoles = this.roles;
            const dbRoles = user.roles;
            const diffRoles = Role.diff(newRoles, dbRoles);
            BusinessUser.addRoles(user, diffRoles.add, err => {
                if (err) return callback(err);
                BusinessUser.removeRoles(user, diffRoles.remove, callback);
            });
        });
};

BusinessUser.table = table;
BusinessUser.idType = idType;

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser('martin-1234', null, 'martin', encryptor.encrypt('pepe')),
];