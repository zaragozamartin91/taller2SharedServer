const dbManager = require('./db-manager');
const encryptor = require('../utils/encryptor');

const table = 'business_user';

function BusinessUser(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
}

BusinessUser.fromObj = function (usrObj) {
    if (usrObj) {
        const user = new BusinessUser();
        Object.keys(usrObj).map(key => user[key] = usrObj[key]);
        return user;
    } else return null;
};

BusinessUser.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        id SERIAL PRIMARY KEY,
        username VARCHAR(64) UNIQUE,
        password VARCHAR(256)
    )`, [], callback);
};

BusinessUser.deleteTable = function (callback) {
    dbManager.query(`DROP TABLE ${table}`, [], callback);
};

BusinessUser.insert = function (userObj, callback) {
    const password = encryptor.encrypt(userObj.password);
    const username = userObj.username;
    dbManager.query(`INSERT INTO ${table}(username,password) 
        VALUES ($1,$2) RETURNING *`,
        [username, password], (err, res) => {
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

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser(100, 'martin', encryptor.encrypt('pepe')),
    new BusinessUser(101, 'exequiel', encryptor.encrypt('posting')),
    new BusinessUser(100, 'javier', encryptor.encrypt('rules')),
];