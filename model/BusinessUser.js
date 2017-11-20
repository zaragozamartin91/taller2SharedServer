/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const encryptor = require('../utils/encryptor');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const Role = require('./Role');
const logger = require('log4js').getLogger('BusinessUser');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'business_users';
const idType = 'VARCHAR(64)';
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';

/* CODIGO -------------------------------------------------------------------------------------- */

function hashUser({ id, username, name, surname, password }) {
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
function BusinessUser(id, _ref, username, password, name = DEFAULT_NAME, surname = DEFAULT_SURNAME, roles = []) {
    this.id = id;
    this._ref = _ref || '';
    this.username = username;
    this.password = password;
    this.name = name;
    this.surname = surname;
    this.roles = roles;
}

BusinessUser.hashUser = hashUser;

BusinessUser.table = table;
BusinessUser.idType = idType;
BusinessUser.DEFAULT_NAME = DEFAULT_NAME;
BusinessUser.DEFAULT_SURNAME = DEFAULT_SURNAME;

/**
 * Crea un usuario de negocio a partir de un objeto.
 * @param {object} usrObj Objeto a partir del cual crear el usuario.
 * @return {BusinessUser} Nuevo usuario de negocio.
 */
function fromObj(usrObj) {
    if (!usrObj) return null;
    const { id, _ref, username, password, name, surname, roles } = usrObj;
    return new BusinessUser(id, _ref, username, password, name, surname, roles);
}

BusinessUser.fromObj = fromObj;

/**
 * Construye un conjunto de usuarios a partir de un resultado de query.
 * @param {Array} rows Filas resultado de una query en la BBDD.
 * @return {Array<BusinessUser>} Usuarios.
 */
function fromRows(rows = []) {
    return rows.map(BusinessUser.fromObj);
}

BusinessUser.fromRows = fromRows;

/**
 * Inserta un usuario de negocio en la BBDD.
 * @param {object} userObj Objeto a partir del cual crear el usuario.
 * @param {Function} callback Funcion a llamar luego de insertar el usuario.
 */
/* istanbul ignore next */
BusinessUser.insert = function (userObj, callback) {
    const { username, id = idGenerator.generateId(username), name = DEFAULT_NAME,
        surname = DEFAULT_SURNAME, roles = [], okRoles = Role.standarize(roles) } = userObj;
    const password = encryptor.encrypt(userObj.password);
    const _ref = hashUser({ id, username, name, surname, password });

    const sql = `INSERT INTO ${table} VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;

    dbManager.queryPromise(sql, [id, _ref, username, password, name, surname, JSON.stringify(okRoles)])
        .then(rows => callback(null, fromObj(rows[0])))
        .catch(err => callback(err));
};

/**
 * Obtiene un usuario de negocio a partir de su id.
 * @param {string} id Id del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
/* istanbul ignore next */
BusinessUser.findById = function (user, callback) {
    const id = user.id || user;
    dbManager.queryPromise(`SELECT * FROM ${table} WHERE id=$1`, [id])
        .then(rows => callback(null, fromObj(rows[0])))
        .catch(err => callback(err));
};

/**
 * Obtiene todos los usuarios de negocio de la BBDD.
 * @param {Function} callback Funcion a invocar luego de buscar a los usuarios.
 */
/* istanbul ignore next */
BusinessUser.find = function (callback) {
    dbManager.queryPromise(`SELECT * FROM ${table}`, [])
        .then(rows => callback(null, fromRows(rows)))
        .catch(err => callback(err));
};

/**
 * Obtiene un usuario de negocio a partir de su username.
 * @param {string} username username del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
/* istanbul ignore next */
BusinessUser.findByUsername = function (username, callback) {
    dbManager.queryPromise(`SELECT * FROM ${table} WHERE username=$1`, [username])
        .then(rows => callback(null, fromObj(rows[0])))
        .catch(err => callback(err));
};

/**
 * Determina si un usuario tiene un rol.
 * @param {BusinessUser} user Usuario a verificar sus roles.
 * @param {Role} role Rol a verificar.
 * @param {Function} callback Funcion a llamar luego de verificar el rol. 
 */
/* istanbul ignore next */
BusinessUser.hasRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = role.type || role.role || role;
    BusinessUser.findById(userId, (err, user) => {
        if (err) return callback(err);
        return callback(null, user.roles.find(r => r == roleId));
    });
};

BusinessUser.hasRoles = function (user, roles, callback) {
    const userId = user.id || user;
    const roleIds = roles.map(role => role.type || role.role || role);

    BusinessUser.findById(userId, (err, user) => {
        if (err) return callback(err);
        
        let roleFound = undefined;
        for (let i = 0; i < roleIds.length; i++) {
            const roleId = roleIds[i];
            roleFound = user.roles.find(r => r == roleId);
            if (roleFound) break;
        }
        callback(null, roleFound);
    });
};

/**
 * Elimina un usuario de la BBDD.
 * @param {BusinessUser} user Usuario a eliminar.
 */
/* istanbul ignore next */
BusinessUser.delete = function (user, callback) {
    const userId = user.id || user;
    const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
    dbManager.query(sql, [userId], (err, res) => {
        if (err) return callback(err);
        callback(null, fromRows(res.rows)[0]);
    });
};

/**
 * Actualiza un usuario en la BBDD.
 * @param {BusinessUser} user Usuario a actualizar en la BBDD.
 * @param {Function} callback Funcion a ejecutar luego de actualizar el usuario: (err,user) => {}.
 */
/* istanbul ignore next */
BusinessUser.update = function (user, callback) {
    logger.debug(`Actualizando usuario ${user.id}`);
    const { id, username, name, surname, password, roles = [], okRoles = Role.standarize(roles) } = user;
    const newRef = hashUser({ id, username, name, surname, password });

    console.log('okRoles: ' + okRoles);

    const sql = `UPDATE ${table} SET username=$1,name=$2,surname=$3,password=$4,roles=$5,_ref=$6 
        WHERE id=$7 RETURNING *`;
    const values = [username, name, surname, password, JSON.stringify(okRoles), newRef, id];

    dbManager.query(sql, values, err => {
        /* Si no hay error, actualizo el valor de _ref */
        if (err) return callback(err);
        callback(null, new BusinessUser(id, newRef, username, password, name, surname, okRoles));
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

/**
 * Pasa los roles del usuario a strings.
 * @return {BusinessUser} this.
 */
BusinessUser.prototype.withStringRoles = function () {
    this.roles = Role.asStrings(this.roles);
    return this;
};

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser('martin-1234', null, 'martin', encryptor.encrypt('pepe')),
];