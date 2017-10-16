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

/* VALIDACION DE OBJETOS DE TIPO VIAJE ------------------------------------------------------------------------------- */

function validatePoint({ address: { street, location: { lat, lon } }, timestamp }) {
    if (typeof street != 'string') return { valid: false, msg: 'Calle invalida' };
    if (typeof lat != 'number') return { valid: false, msg: 'Latitud invalida' };
    if (typeof lon != 'number') return { valid: false, msg: 'Longitud invalida' };
    if (typeof timestamp != 'number') return { valid: false, msg: 'Timestamp de direccion invalido' };

    return { valid: true };
}

function validateRouteItem({ location: { lat, lon }, timestamp }) {
    if (typeof lat != 'number') return { valid: false, msg: 'Latitud de ruta invalida' };
    if (typeof lon != 'number') return { valid: false, msg: 'Longitud de ruta invalida' };
    if (typeof timestamp != 'number') return { valid: false, msg: 'Timestamp de item de ruta invalido' };

    return { valid: true };
}

function __validateTrip({
    id,
    applicationOwner,
    driver,
    passenger,
    start,
    end,
    totalTime,
    waitTime,
    travelTime,
    distance,
    route,
    cost: { currency, value } }) {

    if (typeof driver != 'string') return { valid: false, msg: 'Conductor invalido' };
    if (typeof passenger != 'string') return { valid: false, msg: 'No se indico un pasajero' };
    if (!start) return { valid: false, msg: 'No se indico un punto de inicio' };
    if (!end) return { valid: false, msg: 'No se indico un final' };
    if (typeof waitTime != 'number') return { valid: false, msg: 'Tiempo de espera invalido' };
    if (typeof travelTime != 'number') return { valid: false, msg: 'Tiempo de viaje invalido' };
    if (typeof distance != 'number') return { valid: false, msg: 'Distancia de viaje invalida' };
    if (!route) return { valid: false, msg: 'No se indico una ruta de viaje' };
    if (typeof currency != 'string') return { valid: false, msg: 'Tipo de moneda invalido' };
    if (typeof value != 'number') return { valid: false, msg: 'Costo de viaje invalido' };

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