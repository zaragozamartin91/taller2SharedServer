const Trip = require('../model/Trip');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');
const dataValidator = require('../utils/data-validator');

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const apiVersion = mainConf.apiVersion;

/* FIN DE IMPORTS ----------------------------------------------------------------------------------------------------- */

function buildMetadata(count, total = count) {
    return { count, total, 'next': '', 'prev': '', 'first': '', 'last': '', 'version': apiVersion };
}

/**
 * Busca un viaje en la BBDD y realiza una accion con el viaje encontrado.
 * @param {object} req Request del cliente. 
 * @param {Function} callback Accion a realizar luego de obtener el viaje.
 */
function findTripAndDo({ serverId, params: { tripId } }, res, callback) {
    /* Si serverId esta presente en el request quiere decir que se invoco esta funcion pasando un ApplicationToken.
    Caso contrario, se invoco usando un BusinessToken */
    Trip.findById(tripId, (err, trip) => {
        if (err) return sendMsgCodeResponse(res, 'Error en la BBDD al obtener el viaje', 500);
        if (!trip) return sendMsgCodeResponse(res, 'El viaje no existe', 404);
        if (!serverId) return callback(trip);
        if (serverId && trip.applicationOwner == serverId) return callback(trip);
        return sendMsgCodeResponse(res, 'El viaje no existe', 404);
    });
}

function getTrip(req, res) {
    findTripAndDo(req, res, trip => {
        const metadata = { version: apiVersion };
        res.send({ metadata, trip });
    });
}

exports.getTrip = getTrip;

function getTrips(req, res) {
    Trip.find((err, trips) => {
        if (err) return sendMsgCodeResponse(res, 'Error en la BBDD al obtener los viajes', 500);
        const metadata = buildMetadata(trips.length);
        res.send({ metadata, trips });
    });
}

exports.getTrips = getTrips;

function postTrip(req, res) {
    const serverId = req.serverId;
    const { trip, paymethod } = req.body;

    const tripValidation = dataValidator.validateTrip(trip);

    if (!tripValidation.valid) return sendMsgCodeResponse(res, tripValidation.msg, 400);

    const { totalTime, waitTime, travelTime } = trip;
    trip.totalTime = totalTime || waitTime + travelTime;

    Trip.insert(trip, (err, dbTrip) => {
        if (err) return sendMsgCodeResponse(res, 'Error en la BBDD al insertar el viaje', 500);
        const metadata = { version: apiVersion };
        res.send({ metadata, trip: dbTrip });
    });
}

exports.postTrip = postTrip;