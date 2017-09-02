/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const encryptor = require('../utils/encryptor');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'business_user';
const idType = 'VARCHAR(64)';
const defName = 'UNKNOWN';
const defSurname = 'UNKNOWN';

/* CODIGO -------------------------------------------------------------------------------------- */

function BusinessUser(id, _ref, username, password, name, surname, roles) {
    /* Idstring Se guarda como un string, pero podría ser un número.
    es dependiente de la implementación. */
    this.id = id;

    /* Refstring Hash que es utilizado para prevenir colosiones.
    Cuando se crea un elemento, se debe pasar un valor de undefined (o no debe estar).*/
    this._ref = _ref || '';
    this.username = username;
    this.password = password;
    this.name = name || defName;
    this.surname = surname || defSurname;
    this.roles = [];
}

BusinessUser.fromObj = function (usrObj) {
    if (usrObj) {
        const user = new BusinessUser();
        Object.keys(usrObj).map(key => user[key] = usrObj[key]);
        return user;
    } else return null;
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
    const roles = [];

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
            callback(null, BusinessUser.fromObj(res.rows[0]));
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

BusinessUser.prototype.authenticate = function (password) {
    const hash = this.password;
    return encryptor.verify(hash, password);
};

BusinessUser.prototype.hidePassword = function () {
    this.password = '****';
    return this;
};

BusinessUser.table = table;
BusinessUser.idType = idType;

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser('martin-1234', null, 'martin', encryptor.encrypt('pepe')),
];