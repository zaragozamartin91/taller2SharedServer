const BusinessUser = require('../model/BusinessUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');

const apiVersion = mainConf.apiVersion;

function insertFieldsOk(user) {
    if (user.username && user.password && user.name && user.surname) return true;
    else return false;
}

function invalidInsertFields(user) {
    return !insertFieldsOk(user);
}

exports.postUser = function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const surname = req.body.surname;
    const roles = req.body.roles;

    const userObj = { username, password, name, surname, roles };

    if (invalidInsertFields(userObj)) return responseUtils.sendMsgCodeResponse(res, 'Faltan parametros', 400);

    BusinessUser.insert(userObj, (err, usr) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, 'Error al insertar usuario', 500);

        const metadata = { version: apiVersion };
        res.send({ metadata, businessUser: usr.withStringRoles() });
    });
};
