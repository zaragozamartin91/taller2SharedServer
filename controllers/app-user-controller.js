const ApplicationUser = require('../model/ApplicationUser');
const Car = require('../model/Car');
const mainConf = require('../config/main-config');
const logger = require('log4js').getLogger('app-user-controller');
const responseUtils = require('../utils/response-utils');
const dataValidator = require('../utils/data-validator');
const moment = require('moment');

const apiVersion = mainConf.apiVersion;

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const buildMetadata = responseUtils.buildMetadata;

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

exports.getUserView = getUserView;

exports.getUser = function (req, res) {
    findUserAndDo(req, (err, dbUser) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios', 500);
        if (!dbUser) return sendMsgCodeResponse(res, 'El usuario no existe', 404);
        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.send({ metadata, user });
    });
};


const validatePostUserForm = dataValidator.validateAppUser;
exports.validatePostUserForm = validatePostUserForm;

exports.postUser = function (req, res) {
    const userObj = req.body || {};
    const validation = validatePostUserForm(userObj);
    if (!validation.valid) return sendMsgCodeResponse(res, validation.msg, 400);

    /* Por alguna razon, en el formulario de entrada no hay name y surname sino firstName y lastName */
    userObj.applicationOwner = req.serverId;
    userObj.name = userObj.firstName;
    userObj.surname = userObj.lastName;
    userObj.birthdate = moment(userObj.birthdate).toDate();
    userObj.type = userObj.type.toLowerCase();

    ApplicationUser.findByUsernameAndApp(userObj.username, req.serverId, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al buscar usuarios duplicados', 500);
        if (user) return sendMsgCodeResponse(res, 'Usuario duplicado', 400);

        ApplicationUser.insert(userObj, (err, dbUser) => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al dar de alta el usuario', 500);
            const metadata = { version: apiVersion };
            const user = getUserView(dbUser);
            res.status(201);
            res.send({ metadata, user });
        });
    });
};

exports.deleteUser = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el usuario', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);

        user.delete((err, deleted) => {
            if (err) return sendMsgCodeResponse(res, 'Error al eliminar el usuario', 500);
            sendMsgCodeResponse(res, 'Baja correcta', 204);
        });
    });
};

exports.validateUser = function (req, res) {
    const { username, password, facebookAuthToken } = req.body;
    if (!facebookAuthToken && (!username || !password)) return sendMsgCodeResponse(res, 'Parametros faltantes', 400);

    const serverId = req.serverId;

    function callback(err, dbUser) {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el usuario', 500);
        if (!dbUser) return sendMsgCodeResponse(res, 'El usuario no existe', 404);

        const isValid = dbUser.validate(password, facebookAuthToken);
        if (!isValid) return sendMsgCodeResponse(res, 'Las credenciales son invalidas', 401);

        const metadata = { version: apiVersion };
        const user = getUserView(dbUser);
        res.send({ metadata, user });
    }

    if (username) return ApplicationUser.findByUsernameAndApp(username, serverId, callback);
    else return ApplicationUser.findByFbToken(facebookAuthToken, serverId, callback);
};

exports.updateUser = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (!user) return sendMsgCodeResponse(res, 'El usuario no existe', 404);

        const { _ref, type, username, password, fb, firstName, lastName, country, email, birthdate, images, balance } = req.body;
        const oldRef = _ref;
        if (user._ref != oldRef) return sendMsgCodeResponse(res, 'Ocurrio una colision', 409);

        if (type) {
            console.log('VALIDANDO TIPO ' + type);
            if (!dataValidator.validateAppUserType(type)) return sendMsgCodeResponse(res, 'Tipo de usuario invalido', 400);
            user.type = type.toLowerCase();
        }
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
        user.balance = balance || user.balance;

        user.update(err => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el usuario', 500);
            const metadata = { version: apiVersion };
            res.send({ metadata, user: getUserView(user) });
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

exports.validateCarProperties = validateCarProperties;

exports.postUserCar = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al insertar el auto', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);
        if (!user.isDriver()) return sendMsgCodeResponse(res, 'El usuario no es chofer', 400);

        const userId = user.id;
        const carObj = req.body;
        carObj.owner = userId;

        const carPropsValidation = validateCarProperties(carObj.properties);
        if (!carPropsValidation.valid) return sendMsgCodeResponse(res, carPropsValidation.msg, 400);

        Car.insert(carObj, (err, car) => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al insertar el auto', 500);
            const metadata = { version: apiVersion };
            res.status(201);
            res.send({ metadata, car });
        });
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

        car.delete(err => {
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

exports.updateUserCar = function (req, res) {
    findUserAndDo(req, (err, user) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el auto', 500);
        if (!user) return sendMsgCodeResponse(res, 'No existe el usuario', 404);

        const carId = req.params.carId;
        const cars = user.cars || [];
        const car = cars.filter(c => c.id == carId)[0];
        if (!car) return sendMsgCodeResponse(res, 'No existe el auto', 404);

        const carData = req.body || {};
        if (carData._ref != car._ref) return sendMsgCodeResponse(res, 'Ocurrio una colision', 409);
        car.properties = carData.properties;

        car.update(err => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el auto', 500);
            const metadata = { version: apiVersion };
            res.send({ metadata, car });
        });
    });
};