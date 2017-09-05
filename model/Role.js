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

Role.manager = function() {
    return new Role('manager');
};

Role.user = function() {
    return new Role('user');
};

Role.admin = function() {
    return new Role('admin');
};

Role.prototype.isManager = function() {
    return this.type.valueOf() == 'manager';
};

Role.prototype.isUser = function() {
    return this.type.valueOf() == 'user';
};

Role.prototype.isAdmin = function() {
    return this.type.valueOf() == 'admin';
};

Role.table = table;
Role.idType = idType;

module.exports = Role;