const moment = require('moment');

function validateEmail(email) {
    if (!email) return false;
    const re = /^(\w|\.)+@(\w+\.\w+)+$/;
    return re.test(email);
}

function validateDate(date, format = 'YYYY-MM-DD') {
    if (date) return moment(date, format).isValid();
    else return false;
}

exports.validateEmail = validateEmail;
exports.validateDate = validateDate;

/* VALIDACION DE USUARIOS DE APLICACION ------------------------------------------------------------------------------------------------------------------- */

function validateAppUserType(type = '') {
    type = type.toLowerCase();
    return type == 'passenger' || type == 'driver';
}

exports.validateAppUserType = validateAppUserType;

/**
 * Valida un formulario de usuario.
 * @param {any} userObj Formulario de usuario. 
 * @return {any} Objeto con formato {valid,msg}
 */
function validateAppUser({ type, username, password, firstName, lastName, country, email, birthdate }) {
    if (!type || !username || !password || !firstName || !lastName || !country || !email || !birthdate) return { valid: false, msg: 'No fueron ingresados todos los parametros' };
    if (!validateEmail(email)) return { valid: false, msg: 'Email invalido' };
    if (!validateDate(birthdate)) return { valid: false, msg: 'Fecha de necimiento invalida' };
    if (!validateAppUserType(type)) return { valid: false, msg: 'Tipo de cliente invalido' };
    return { valid: true };
}

exports.validateAppUser = validateAppUser;

/* VALIDACION DE OBJETOS DE TIPO VIAJE ------------------------------------------------------------------------------------------------------------------- */

function validatePoint({ address: { street, location: { lat, lon } }, timestamp }) {
    if (typeof street != 'string') return { valid: false, msg: 'Calle invalida' };
    if (typeof lat != 'number') return { valid: false, msg: 'Latitud de inicio/fin invalida' };
    if (typeof lon != 'number') return { valid: false, msg: 'Longitud de inicio/fin invalida' };
    if (typeof timestamp != 'number') return { valid: false, msg: 'Timestamp de inicio/fin invalido' };

    return { valid: true };
}

function validateRouteItem({ location: { lat, lon }, timestamp }) {
    if (typeof lat != 'number') return { valid: false, msg: 'Latitud de item de ruta invalida' };
    if (typeof lon != 'number') return { valid: false, msg: 'Longitud de item de ruta invalida' };
    if (typeof timestamp != 'number') return { valid: false, msg: 'Timestamp de item de ruta invalido' };

    return { valid: true };
}

function __validateTrip({
    driver,
    passenger,
    start,
    end,
    totalTime,
    waitTime,
    travelTime,
    distance,
    route }) {

    if (typeof driver != 'string') return { valid: false, msg: 'Conductor invalido' };
    if (typeof passenger != 'string') return { valid: false, msg: 'No se indico un pasajero' };
    if (!start) return { valid: false, msg: 'No se indico un punto de inicio' };
    if (!end) return { valid: false, msg: 'No se indico un final' };
    if (typeof waitTime != 'number') return { valid: false, msg: 'Tiempo de espera invalido' };
    if (typeof travelTime != 'number') return { valid: false, msg: 'Tiempo de viaje invalido' };
    if (typeof distance != 'number') return { valid: false, msg: 'Distancia de viaje invalida' };
    if (!route) return { valid: false, msg: 'No se indico una ruta de viaje' };

    try {
        const startValidation = validatePoint(start);
        if (!startValidation.valid) return startValidation;
    } catch (error) {
        return { valid: false, msg: 'Estructura de start invalida' };
    }

    try {
        const endValidation = validatePoint(end);
        if (!endValidation.valid) return endValidation;
    } catch (error) {
        return { valid: false, msg: 'Estructura de end invalida' };
    }

    let routeValidation;
    route.forEach(r => {
        try {
            routeValidation = validateRouteItem(r);
            if (!routeValidation.valid) return routeValidation;
        } catch (error) {
            return { valid: false, msg: 'Estructura de punto de ruta invalida' };
        }
    });

    return { valid: true };
}

function validateTrip(tripObj) {
    try {
        return __validateTrip(tripObj);
    } catch (error) {
        console.error(error);
        return { valid: false, msg: 'Estructura de objeto viaje invalida' };
    }
}

exports.validateTrip = validateTrip;

/* VALIDACION DE OBJETOS DE TIPO TRANSACCION ------------------------------------------------------------------------------------------------------------------- */

function validateTransaction(transReq) {
    const { transaction, paymethod, paymentMethod } = transReq;
    if (!transaction && !transaction.id) return { valid: false, message: 'No se indico la transaccion pendiente' };
    if (!paymethod && !paymentMethod) return { valid: false, message: 'No se indico el metodo de pago' };

    return { valid: true };
}

exports.validateTransaction = validateTransaction;