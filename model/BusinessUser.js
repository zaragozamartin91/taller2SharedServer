const bcrypt = require('bcryptjs');
const dbManager = require('./db-manager');

const table = 'business_user';

function BusinessUser(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
}

function encryptPassword(password) {
    return bcrypt.hashSync(password, 10);
}

BusinessUser.fromObj = function (usrObj) {
    const user = new BusinessUser();
    Object.keys(usrObj).map(key => user[key] = usrObj[key]);
    return user.hidePassword();
};

BusinessUser.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        id SERIAL PRIMARY KEY,
        username VARCHAR(64),
        password VARCHAR(256)
    )`, [], callback);
};

BusinessUser.insert = function (userObj, callback) {
    const password = encryptPassword(userObj.password);
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
    })
};

BusinessUser.prototype.authenticate = function (password) {
    const hash = this.password;
    const isValid = bcrypt.compareSync(password, hash);
    return isValid;
};

BusinessUser.prototype.hidePassword = function () {
    this.password = '****';
    return this;
};

module.exports = BusinessUser;

BusinessUser.mockUsers = [
    new BusinessUser(100, "martin", encryptPassword("pepe")),
    new BusinessUser(101, "exequiel", encryptPassword("posting")),
    new BusinessUser(100, "javier", encryptPassword("rules")),
];