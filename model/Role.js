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
    Role.insert('admin',
        () => Role.insert('user'),
        () => Role.insert('manager'), callback);
};

Role.table = table;
Role.idType = idType;

module.exports = Role;