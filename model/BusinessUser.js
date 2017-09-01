const bcrypt = require('bcryptjs');
const dbManager = require('./db-manager');

function BusinessUser(id, username, password) {
    this.id = id;
    this.username = username;
    this.password = password;
}

const table = 'business_user';

BusinessUser.fromObj = function (usrObj) {
    const user = new BusinessUser();
    Object.keys(usrObj).map((key, index) => user[key] = usrObj[key]);
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
    const password = bcrypt.hashSync(userObj.password, 10);
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