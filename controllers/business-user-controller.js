const BusinessUser = require('../model/BusinessUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');

const logger = require('log4js').getLogger('business-user-controller');

const apiVersion = mainConf.apiVersion;

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const buildMetadata = responseUtils.buildMetadata;

function insertFieldsOk({ username, password, name, surname }) {
    if (username && password && name && surname) return true;
    else return false;
}

function invalidInsertFields(user) {
    return !insertFieldsOk(user);
}

exports.postUser = function (req, res) {
    const { username, password, name, surname, roles } = req.body;
    const userObj = { username, password, name, surname, roles };

    if (invalidInsertFields(userObj)) return sendMsgCodeResponse(res, 'Faltan parametros', 400);

    BusinessUser.findByUsername(username, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al buscar usuarios duplicados', 500);
        if (user) return sendMsgCodeResponse(res, 'Usuario duplicado', 400);

        console.log(user);

        BusinessUser.insert(userObj, (err, usr) => {
            if (err) return sendMsgCodeResponse(res, 'Error al insertar usuario', 500);

            const metadata = { version: apiVersion };
            res.send({ metadata, businessUser: usr.withStringRoles() });
        });
    });
};

exports.updateMyUser = function (req, res) {
    /* Obtengo el id de usuario a partir del token decodificado */
    const userId = req.decodedToken.id;
    logger.debug(`userId: ${userId}`);
    updateUser(userId, req, res);
};

exports.updateUser = function (req, res) {
    /* obtengo el id de usuario a partir de un parametro de url */
    const userId = req.params.userId;
    logger.debug(`userId: ${userId}`);
    updateUser(userId, req, res);
};

function updateUser(userId, req, res) {
    const { username, password, newPassword = password, name, surname, roles, _ref, oldRef = _ref } = req.body;

    BusinessUser.findById(userId, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Error al buscar el usuario', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario solicitado', 404);
        if (user._ref != oldRef) return sendMsgCodeResponse(res, 'Ocurrio una colision', 409);

        user.username = username || user.username;

        const oldPassword = user.password;
        /* si se envio un password en el request y es distinto al actual entonces se quiere cambiar el password */
        if (newPassword && oldPassword.valueOf() != newPassword) {
            logger.debug(`Se modificara el password de ${userId}`);
            user.setPassword(newPassword);
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.roles = roles || user.roles;

        BusinessUser.update(user, (err, updatedUser) => {
            if (err) return sendMsgCodeResponse(res, 'Error al actualizar el usuario', 500);
            const metadata = { version: apiVersion };
            res.send({ metadata, businessUser: updatedUser });
        });
    });
}

exports.getUsers = function (req, res) {
    BusinessUser.find((err, users) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios', 500);

        const metadata = buildMetadata(users.length, users.length);
        const resUsers = users.map(u => u.withStringRoles());
        res.send({ metadata, businessUser: resUsers });
    });
};

exports.deleteUser = function (req, res) {
    const userId = req.params.userId;
    BusinessUser.delete(userId, (err, user) => {
        if (err) {
            logger.debug(err);
            return sendMsgCodeResponse(res, 'Ocurrio un error al eliminar el usuario', 500);
        }
        if (!user) return sendMsgCodeResponse(res, 'No existe el recurso solicitado', 404);

        sendMsgCodeResponse(res, 'Baja correcta', 204);
    });
};

exports.getMyUser = function (req, res) {
    const decodedToken = req.decodedToken;
    const userId = decodedToken.id;
    getUser(userId, req, res);
};

exports.getUser = function (req, res) {
    const userId = req.params.userId;
    getUser(userId, req, res);
};

function getUser(userId, req, res) {
    BusinessUser.findById(userId, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Unexpected error', 500);
        if (!user) return sendMsgCodeResponse(res, 'user inexistente', 404);

        const metadata = { version: apiVersion };
        res.send({ metadata, businessUser: user.withStringRoles() });
    });
}