const ApplicationUser = require('../model/ApplicationUser');
const mainConf = require('../config/main-config');
const logger = require('log4js').getLogger('app-user-controller');
const responseUtils = require('../utils/response-utils');
const dataValidator = require('../utils/data-validator');

const apiVersion = mainConf.apiVersion;
const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

function buildMetadata(count = 0, total = count) {
    return {
        count,
        total,
        'next': '',
        'prev': '',
        'first': '',
        'last': '',
        'version': apiVersion
    };
}

exports.getUsers = function (req, res) {
    const serverId = req.serverId;

    function callback(err, dbUsers) {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios de ' + serverId, 500);
        const metadata = buildMetadata(dbUsers.length);
        const users = dbUsers.map(getUserView);
        res.send({ metadata, users });
    }

    /* Si serverId esta presente en el request quiere decir que se invoco esta funcion pasando un ApplicationToken.
    Caso contrario, se invoco usando un BusinessToken */
    if (serverId) return ApplicationUser.findByApp(serverId, callback);
    else return ApplicationUser.find(callback);
};

exports.getUser = function (req, res) {
    const serverId = req.serverId;
    const userId = req.params.userId;

    function callback(err, dbUser) {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios de ' + serverId, 500);
        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.send({ metadata, user });
    }

    /* Si serverId esta presente en el request quiere decir que se invoco esta funcion pasando un ApplicationToken.
    Caso contrario, se invoco usando un BusinessToken */
    if (serverId) return ApplicationUser.findByIdAndApp(userId, serverId, callback);
    else return ApplicationUser.findById(userId, callback);
};

/**
 * Obtiene una vista simplificada del usuario para enviar como respuesta al cliente.
 * @param {ApplicationUser} user Usuario del cual obtener la vista. 
 */
function getUserView({ id, _ref, applicationOwner, type, cars, username, name, surname, country, email, birthdate, images, balance }) {
    return { id, _ref, applicationOwner, type, cars, username, name, surname, country, email, birthdate, images, balance };
}

exports.postUser = function (req, res) {
    const userObj = req.body || {};
    const validation = validatePostUserForm(userObj);
    if (!validation.valid) return sendMsgCodeResponse(res, validation.msg, 400);

    /* Por alguna razon, en el formulario de entrada no hay name y surname sino firstName y lastName */
    userObj.applicationOwner = req.serverId;
    userObj.name = userObj.firstName;
    userObj.surname = userObj.lastName;

    ApplicationUser.insert(userObj, (err, dbUser) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al dar de alta el usuario', 500);
        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.status(201);
        res.send({ metadata, user });
    });
};

/**
 * Valida un formulario de usuario.
 * @param {any} userObj Formulario de usuario. 
 * @return {any} Objeto con formato {valid,msg}
 */
function validatePostUserForm({ type, username, password, firstName, lastName, country, email, birthdate }) {
    if (!type || !username || !password || !firstName || !lastName || !country || !email || !birthdate) return { valid: false, msg: 'No fueron ingresados todos los parametros' };
    if (!dataValidator.validateEmail(email)) return { valid: false, msg: 'Email invalido' };
    if (!dataValidator.validateDate(birthdate)) return { valid: false, msg: 'Fecha de necimiento invalida' };
    return { valid: true };
}

exports.deleteUser = function (req, res) {
    const userId = req.params.userId;
    ApplicationUser.delete(userId, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Error al eliminar el usuario', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);
        sendMsgCodeResponse(res, 'Baja correcta', 204);
    });
};