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

exports.updateUser = function (req, res) {
    const userId = req.params.userId;

    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const surname = req.body.surname;
    const roles = req.body.roles;

    BusinessUser.findById(userId, (err, user) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, 'Error al buscar el usuario', 500);
        if (!user) return responseUtils.sendMsgCodeResponse(res, 'No existe el usuario solicitado', 404);

        user.username = username || user.username;
        if (password) user.setPassword(password);
        else user.password;
        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.roles = roles || user.roles;

        user.update(err => {
            if (err && err.message == 'COLISION') return responseUtils.sendMsgCodeResponse(res, 'Conflicto en el update', 409);
            if (err) return responseUtils.sendMsgCodeResponse(res, 'Error al actualizar el usuario', 500);

            const metadata = { version: apiVersion };
            res.send({ metadata, businessUser: user.withStringRoles() });
        });
    });
};
