const dbManager = require('./db-manager');
const table = 'role';
const idType = 'VARCHAR(16)';

function Role(type) {
    this.type = type;
}

Role.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        type ${idType} PRIMARY KEY
    )`, [], callback);
};

Role.insert = function (type, callback) {
    dbManager.query(`INSERT INTO ${table} VALUES($1)`, [type], callback);
};

Role.createRoles = function (callback) {
    Role.insert('user', err => console.error(err));
    Role.insert('manager', err => console.error(err));
    Role.insert('admin', err => console.error(err));
};

Role.fromObj = function (roleObj) {
    return new Role(roleObj.type || roleObj.role || roleObj);
};

Role.manager = function () {
    return new Role('manager');
};

Role.user = function () {
    return new Role('user');
};

Role.admin = function () {
    return new Role('admin');
};

/**
 * Convierte a objetos de tipo Role en un arreglo de sus nombres.
 * @param {Array<Role>} roles Roles a convertir en un arreglo de strings.
 * @return {Array<string>} Arreglo de nombres de roles.
 */
Role.asStrings = function (roles) {
    roles = roles || [];
    const strings = [];
    roles.forEach(role => strings.push(role.type || role));
    return strings;
};

/**
 * Crea un arrelgo de objetos de tipo Role a partir de un arreglo de strings con nombres de roles.
 * @param {Array<string>} roleStrings Nombres de roles.
 * @return {Array<Role>} Arreglo de roles.
 */
Role.fromStrings = function (roleStrings) {
    roleStrings = Role.asStrings(roleStrings);
    const roles = [];
    roleStrings.forEach(s => roles.push(new Role(s)));
    return roles;
};

/**
 * Determina la diferencia de roles.
 * @param {Array} roles1 Roles en BBDD.
 * @param {Array} roles2 Roles nuevos.
 * @return {object} {keep:'Roles a guardar', add:'roles a agregar', remove:'roles a eliminar'}
 */
Role.diff = function (roles1, roles2) {
    roles1 = Role.asStrings(roles1);
    roles2 = Role.asStrings(roles2);

    console.log(`roles1: ${roles1}`);
    console.log(`roles2: ${roles2}`);

    const keep = [];
    const remove = [];
    const add = [];

    roles1.forEach(role1 => {
        if (roles2.indexOf(role1) >= 0) keep.push(role1);
        else remove.push(role1);
    });

    roles2.forEach(role2 => {
        if (roles1.indexOf(role2) < 0) add.push(role2);
    });

    const diff = { keep, add, remove };
    console.log('diff:');
    console.log(diff);
    return diff;
};

Role.prototype.isManager = function () {
    return this.type.valueOf() == 'manager';
};

Role.prototype.isUser = function () {
    return this.type.valueOf() == 'user';
};

Role.prototype.isAdmin = function () {
    return this.type.valueOf() == 'admin';
};

Role.table = table;
Role.idType = idType;

module.exports = Role;