const moment = require('moment');
const distanceMeasurer = require('../utils/distance-measurer');
const ruleHandler = require('../utils/rule-handler');
const Trip = require('../model/Trip');
const ApplicationUser = require('../model/ApplicationUser');
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
    const { trip, paymethod } = req.body;
    const tripValidation = dataValidator.validateTrip(trip);

    if (!tripValidation.valid) return sendMsgCodeResponse(res, tripValidation.msg, 400);

    const { totalTime, waitTime, travelTime } = trip;
    trip.totalTime = totalTime || waitTime + travelTime;

    const serverId = req.serverId;
    trip.applicationOwner = serverId;

    Trip.insert(trip, (err, dbTrip) => {
        if (err) return sendMsgCodeResponse(res, 'Error en la BBDD al insertar el viaje', 500);
        const metadata = { version: apiVersion };
        res.send({ metadata, trip: dbTrip });
    });
}

exports.postTrip = postTrip;

function measureDistance(start, end) {
    const lat1 = start.address.location.lat;
    const lon1 = start.address.location.lon;
    const lat2 = end.address.location.lat;
    const lon2 = end.address.location.lon;
    return distanceMeasurer.distanceMt(lat1, lon1, lat2, lon2);
}

function getLast30MinsTrips(trips) {
    const minsGap = 1000 * 60 * 30;
    return trips.filter(({ date }) => {
        const timeGap = Date.now() - new Date(date).getTime();
        return timeGap < minsGap;
    });
}

exports.estimate = function (req, res) {
    const { start, end, passenger, distance, email = '' } = req.body;
    if (!passenger) return sendMsgCodeResponse(res, 'Falta parametro de pasajero', 400);
    if (!distance && (!start || !end)) return sendMsgCodeResponse(res, 'Faltan parametros para calcular distancia', 400);

    let mts;
    try {
        mts = distance || measureDistance(start, end);
    } catch (error) {
        return sendMsgCodeResponse(res, 'Error al obtener distancia de viaje', 400);
    }

    const p1 = new Promise((resolve, reject) => Trip.findByUser(passenger, (err, trips) => {
        if (err) reject(err);
        else resolve(trips);
    })).then(trips => {
        const tripCount = trips.length;
        const last30minsTripCount = getLast30MinsTrips(trips).length;

        return new Promise((resolve, reject) => ApplicationUser.findById(passenger, (err, user) => {
            if (err) reject(err);
            else resolve(user);
        }));

    }).then(user => {
        const pocketBalance = user.getBalance('PESO');
    }).catch(err => sendMsgCodeResponse(res, 'Error en la BBDD al calcular el viaje', 500));

    const fact = {
        type: 'passenger',
        mts,
        operations: [],
        dayOfWeek: moment().day(),
        hour: moment().hour(),
        tripCount: 1,
        last30minsTripCount: 11,
        email: 'mzaragoza@gmail.com',
        pocketBalance: { currency: 'peso', value: 100 },
        todayTripCount: 11
    };


};