const ApplicationUser = require('../model/ApplicationUser');
const Car = require('../model/Car');
const mainConf = require('../config/main-config');
const logger = require('log4js').getLogger('app-user-controller');
const responseUtils = require('../utils/response-utils');
const dataValidator = require('../utils/data-validator');
const moment = require('moment');

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

/**
 * Busca un usuario en la BBDD y realiza una accion con el usuario encontrado.
 * @param {object} req Request del cliente. 
 * @param {Function} callback Accion a realizar luego de obtener el usuario.
 */
function findUserAndDo({ serverId, params: { userId } }, callback) {
    /* Si serverId esta presente en el request quiere decir que se invoco esta funcion pasando un ApplicationToken.
    Caso contrario, se invoco usando un BusinessToken */
    if (serverId) return ApplicationUser.findByIdAndApp(userId, serverId, callback);
    else return ApplicationUser.findById(userId, callback);
}

/**
 * Obtiene una vista simplificada del usuario para enviar como respuesta al cliente.
 * @param {ApplicationUser} user Usuario del cual obtener la vista. 
 */
function getUserView({ id, _ref, applicationOwner, type, cars, username, name, surname, country, email, birthdate, images, balance } = {}) {
    return { id, _ref, applicationOwner, type, cars, username, name, surname, country, email, birthdate, images, balance };
}

exports.getUser = function (req, res) {
    findUserAndDo(req, (err, dbUser) => {
        if (!dbUser) return sendMsgCodeResponse(res, 'El usuario no existe', 404);
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios', 500);
        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
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

exports.postUser = function (req, res) {
    const userObj = req.body || {};
    const validation = validatePostUserForm(userObj);
    if (!validation.valid) return sendMsgCodeResponse(res, validation.msg, 400);

    /* Por alguna razon, en el formulario de entrada no hay name y surname sino firstName y lastName */
    userObj.applicationOwner = req.serverId;
    userObj.name = userObj.firstName;
    userObj.surname = userObj.lastName;
    userObj.birthdate = moment(userObj.birthdate).toDate();

    ApplicationUser.insert(userObj, (err, dbUser) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al dar de alta el usuario', 500);
        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.status(201);
        res.send({ metadata, user });
    });
};

exports.deleteUser = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el usuario', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);

        user.delete((err, deleted) => {
            if (err) return sendMsgCodeResponse(res, 'Error al eliminar el usuario', 500);
            if (!deleted) return sendMsgCodeResponse(res, 'El usuario no fue eliminado', 404);
            sendMsgCodeResponse(res, 'Baja correcta', 204);
        });
    });
};

exports.validateUser = function (req, res) {
    const { username, password, facebookAuthToken } = req.body;
    if (!username || (!password && !facebookAuthToken)) return sendMsgCodeResponse(res, 'Parametros faltantes', 400);

    const serverId = req.serverId;
    ApplicationUser.findByUsernameAndApp(username, serverId, (err, dbUser) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el usuario', 500);
        if (!dbUser) return sendMsgCodeResponse(res, 'El usuario no existe', 401);

        const isValid = dbUser.validate(password, facebookAuthToken);
        if (!isValid) return sendMsgCodeResponse(res, 'Las credenciales son invalidas', 401);

        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.send({ metadata, user });
    });
};

exports.updateUser = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (!user) return sendMsgCodeResponse(res, 'El usuario no existe', 404);

        const { _ref, type, username, password, fb, firstName, lastName, country, email, birthdate, images } = req.body;
        const oldRef = _ref;
        if (user._ref != oldRef) return sendMsgCodeResponse(res, 'Ocurrio una colision', 409);

        user.type = type || user.type;
        user.username = username || user.username;
        user.password = password || user.password;
        user.fb = fb || user.fb;
        user.name = firstName || user.name;
        user.surname = lastName || user.surname;
        user.country = country || user.country;
        if (email && !dataValidator.validateEmail(email)) return sendMsgCodeResponse(res, 'El email es invalido', 400);
        user.email = email || user.email;
        if (birthdate) {
            const dateIsValid = dataValidator.validateDate(birthdate);
            if (!dateIsValid) return sendMsgCodeResponse(res, 'La fecha es invalida', 400);
            else user.birthdate = moment(birthdate).toDate();
        }
        user.images = images || user.images;

        user.update(err => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el usuario', 500);
            const metadata = { version: apiVersion };
            res.send({ metadata, user });
        });
    });
};

exports.getUserCars = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener el usuario', 500);
        if (!user) return sendMsgCodeResponse(res, 'El usuario no existe', 404);

        const cars = user.cars;
        const metadata = buildMetadata(cars.length);
        res.send({ metadata, cars });
    });
};

function validateCarProperties(properties = []) {
    let res = { valid: true };
    properties.forEach(p => {
        if (!p.name) return res = { valid: false, msg: 'Falta "name" en alguna de las propiedades' };
        if (!p.value) return res = { valid: false, msg: 'Falta "value" en alguna de las propiedades' };
    });
    return res;
}

exports.postUserCar = function (req, res) {
    const userId = req.params.userId;
    const carObj = req.body;
    carObj.owner = userId;

    const carPropsValidation = validateCarProperties(carObj.properties);
    if (!carPropsValidation.valid) return sendMsgCodeResponse(res, carPropsValidation.msg, 400);

    Car.insert(carObj, (err, car) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al insertar el auto', 500);
        const metadata = { version: apiVersion };
        res.send({ metadata, car });
    });
};

exports.deleteUserCar = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al eliminar el auto', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);

        const carId = req.params.carId;
        const cars = user.cars || [];
        const car = cars.filter(c => c.id == carId)[0];
        if (!car) return sendMsgCodeResponse(res, 'No existe el auto', 404);

        Car.delete(car, err => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al eliminar el auto', 500);
            sendMsgCodeResponse(res, 'Baja correcta', 204);
        });
    });
};

exports.getUserCar = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener el auto', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);

        const carId = req.params.carId;
        const cars = user.cars || [];
        const car = cars.filter(c => c.id == carId)[0];
        if (!car) return sendMsgCodeResponse(res, 'No existe el auto', 404);

        const metadata = { version: apiVersion };
        res.send({ metadata, car });
    });
};