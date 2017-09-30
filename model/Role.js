const logger = require('log4js').getLogger('Role');

const validRoles = ['admin', 'manager', 'user'];

/**
 * Crea una nueva instancia de rol de usuario de negocio.
 * @constructor
 * @this {Role}
 * @param {string} type Tipo de rol [admin||user||manager].
 * @return {Role} nuevo rol.
 */
function Role(type = '') {
    this.type = type.toLowerCase();
}

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
Role.asStrings = function (roles = []) {
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
 * Filtra un arreglo de roles dejando solo los roles validos.
 * @param {Array<Role>} roles roles a filtrar.
 * @return {Array<Role>} Arreglo con roles validos.
 */
Role.filterValid = function (roles) {
    roles = Role.fromStrings(roles);
    return roles.filter(r => r.isValid());
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
    console.log(`diff ${roles1} vs ${roles2}:`);
    console.log(diff);
    return diff;
};

Role.isValid = function (role) {
    const type = Role.fromObj(role).type;
    return validRoles.indexOf(type) >= 0;
};

/**
 * Filtra y estandariza un conjunto de roles y los devuelve como strings.
 * @param {Array<Role>} roles Conjunto de roles.
 * @return {Array<string>} Ids de los roles en lowercase.
 */
Role.standarize = function (roles) {
    roles = Role.filterValid(roles);
    roles = Role.asStrings(roles);
    return roles.map(role => role.toLowerCase());
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

Role.prototype.isValid = function () {
    return Role.isValid(this.type);
};

module.exports = Role;