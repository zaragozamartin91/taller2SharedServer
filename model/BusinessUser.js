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
const DEFAULT_NAME = 'UNKNOWN';
const DEFAULT_SURNAME = 'UNKNOWN';

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
function BusinessUser(id, _ref, username, password, name = DEFAULT_NAME, surname = DEFAULT_SURNAME, roles = []) {
    this.id = id;
    this._ref = _ref || '';
    this.username = username;
    this.password = password;
    this.name = name;
    this.surname = surname;
    this.roles = roles;
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
 * @return {Array<BusinessUser>} Usuarios.
 */
function buildUsersFromRows(rows) {
    if (!rows || rows.length == 0) return [];
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

BusinessUser.buildUsersFromRows = buildUsersFromRows;

/**
 * Crea la tabla de usuarios de negocio.
 * @param {Function} callback Funcion a invocar luego de crear la tabla.
 */
BusinessUser.createTable = function (callback) {
    const sql = `CREATE TABLE ${table} (
        id ${idType} PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        name VARCHAR(32) DEFAULT '${DEFAULT_NAME}',
        surname VARCHAR(32) DEFAULT '${DEFAULT_SURNAME}'
    )`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

BusinessUser.dropTable = function (callback) {
    dbManager.query(`DROP TABLE ${table}`, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

/**
 * Crea la tabla de roles de usuario de negocio.
 * @param {Function} callback Funcion a invocar luego que la tabla fue creada.
 */
BusinessUser.createRolesTable = function (callback) {
    dbManager.query(`CREATE TABLE ${rolesTable} (
        business_user ${idType} REFERENCES ${table}(id) ON DELETE CASCADE,
        role ${Role.idType} REFERENCES ${Role.table}(type) ON DELETE CASCADE,
        UNIQUE(business_user,role)
    )`, [], callback);
};

BusinessUser.dropRolesTable = function (callback) {
    dbManager.query(`DROP TABLE ${rolesTable}`, [], err => {
        logger.error(err);
        callback();
    });
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
    const name = userObj.name || DEFAULT_NAME;
    const surname = userObj.surname || DEFAULT_SURNAME;
    const _ref = hashUser(id, username, name, surname, password);
    const roles = userObj.roles || [];

    const sql = `INSERT INTO ${table} VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;

    dbManager.query(sql, [id, _ref, username, password, name, surname], (err, res) => {
        if (err) return callback(err);

        const rows = res.rows;
        if (!rows.length) return callback(new Error('Usuario no insertado'), null);

        logger.debug(`Usuario ${id} insertado`);
        const user = rows[0];

        BusinessUser.addRoles(user, roles, () => {
            user.roles = Role.fromStrings(roles);
            callback(null, BusinessUser.fromObj(user));
        });
    });
};

/**
 * Obtiene un usuario de negocio a partir de su id.
 * @param {string} id Id del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
BusinessUser.findById = function (id, callback) {
    const sql = `SELECT u.*,${rolesTable}.role FROM ${table} u 
        LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table}) WHERE u.id=$1`;

    dbManager.query(sql, [id], (err, res) => callback(err, buildUsersFromRows(res.rows)[0]));
};

/**
 * Obtiene todos los usuarios de negocio de la BBDD.
 * @param {Function} callback Funcion a invocar luego de buscar a los usuarios.
 */
BusinessUser.find = function (callback) {
    console.log('llamando a find con');
    console.log(callback);
    const sql = `SELECT u.*,${rolesTable}.role FROM ${table} AS u 
        LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table})`;

    dbManager.query(sql, [], (err, res) => callback(err, buildUsersFromRows(res.rows)));
};


/**
 * Obtiene un usuario de negocio a partir de su username.
 * @param {string} username username del usuario de negocio buscado.
 * @param {Function} callback Funcion a invocar al obtener el usuario.
 */
BusinessUser.findByUsername = function (username, callback) {
    const sql = `SELECT u.*,${rolesTable}.role 
        FROM ${table} u LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table}) WHERE u.username=$1`;

    dbManager.query(sql, [username], (err, res) => callback(err, buildUsersFromRows(res.rows)[0]));
};

/**
 * Agrega un rol a un usuario de negocio.
 * @param {BusinessUser} user Usuario al cual agregar el rol.
 * @param {Role} role Rol a agregar.
 * @param {function} callback Funcion a invocar luego de agregar el rol.
 */
BusinessUser.addRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = Role.fromObj(role).type;

    if (Role.isValid(roleId)) {
        logger.debug(`Agregando rol ${roleId} al usuario ${userId}`);
        dbManager.query(`INSERT INTO ${rolesTable} VALUES($1,$2)`, [userId, roleId], callback);
    } else {
        logger.debug(`El rol ${roleId} es invalido!`);
        callback(new Error(`Rol ${roleId} invalido!`));
    }
};

/**
 * Elimina roles de un usuario.
 * @param {BusinessUser} user Usuario al cual remover roles.
 * @param {Array<string>} roles Roles a remover.
 * @param {Function} callback Funcion a ejecutar luego de remover los roles.
 */
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
    dbManager.query(sql, [userId], err => callback(err, user));
};

/**
 * Agrega un conjunto de roles a un usuario.
 * @param {BusinessUser} user Usuario al cual agregarle roles.
 * @param {Array<string>} roles Roles a agregar.
 * @param {Function} callback Funcion a invocar al finalizar (err,user) => {}.
 */
BusinessUser.addRoles = function (user, roles, callback) {
    roles = Role.asStrings(roles);
    if (roles.length == 0) return callback(null, user);

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

/**
 * Determina si un usuario tiene un rol.
 * @param {BusinessUser} user Usuario a verificar sus roles.
 * @param {Role} role Rol a verificar.
 * @param {Function} callback Funcion a llamar luego de verificar el rol. 
 */
BusinessUser.hasRole = function (user, role, callback) {
    const userId = user.id || user;
    const roleId = role.type || role.role || role;
    const sql = `SELECT role FROM ${rolesTable} WHERE business_user=$1 AND role=$2`;
    dbManager.query(sql, [userId, roleId], (err, res) => callback(err, res.rows.length > 0));
};

/**
 * Elimina un usuario de la BBDD.
 * @param {BusinessUser} user Usuario a eliminar.
 */
BusinessUser.delete = function (user, callback) {
    const userId = user.id || user;
    const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
    dbManager.query(sql, [userId], (err, res) => {
        if (err) return callback(err);
        callback(null, buildUsersFromRows(res.rows)[0]);
    });
};

/**
 * Actualiza un usuario en la BBDD.
 * @param {BusinessUser} user Usuario a actualizar en la BBDD.
 * @param {Function} callback Funcion a ejecutar luego de actualizar el usuario: (err,user) => {}.
 */
BusinessUser.update = function (user, callback) {
    logger.debug(`Actualizando usuario ${user.id}`);
    const oldRef = user._ref;

    const findUserSql = `SELECT u.*,${rolesTable}.role FROM ${table} AS u 
    LEFT OUTER JOIN ${rolesTable} ON (u.id=${rolesTable}.${table}) WHERE u.id=$1 AND u._ref=$2`;

    /* Primero verificamos que otro no haya cambiado el usuario */
    dbManager.query(findUserSql, [user.id, oldRef], (err, res) => {
        if (err) return callback(err);

        if (!res.rows[0]) {
            /* Si el usuario no es hayado, es muy probable que alguien mas lo haya actualizado y que se haya producido
            una colision */
            const error = new Error(`Ocurrio una colision al actualizar el usuario ${user.id}`);
            error.type = 'COLLISION';
            return callback(error);
        }

        const dbUser = buildUsersFromRows(res.rows)[0];

        /* Luego actualizamos los campos del usuario */
        const updateSql = `UPDATE ${table} SET username=$1, password=$2, _ref=$3, name=$4, surname=$5 WHERE id=$6`;
        const newRef = hashUser(user.id, user.username, user.name, user.surname, user.password);
        const updateValues = [user.username, user.password, newRef, user.name, user.surname, user.id];

        dbManager.query(updateSql, updateValues, (err, res) => {
            if (err) return callback(err);

            /* Actualizo el valor de _ref si la actualizacion fue exitosa */
            user._ref = newRef;

            /* Finalmente agregamos/quitamos roles */
            const newRoles = user.roles;
            const oldRoles = dbUser.roles;
            const diffRoles = Role.diff(oldRoles, newRoles);
            BusinessUser.addRoles(user, diffRoles.add, err => {
                if (err) return logger.error(err);
                const rolesToRemove = diffRoles.remove;
                BusinessUser.removeRoles(user, diffRoles.remove, callback);
            });
        });
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

BusinessUser.table = table;
BusinessUser.idType = idType;

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser('martin-1234', null, 'martin', encryptor.encrypt('pepe')),
];