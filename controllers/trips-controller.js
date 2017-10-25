const moment = require('moment');
const distanceMeasurer = require('../utils/distance-measurer');
const ruleHandler = require('../utils/rule-handler');
const Trip = require('../model/Trip');
const Rule = require('../model/Rule');
const Transaction = require('../model/Transaction');
const ApplicationUser = require('../model/ApplicationUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');
const dataValidator = require('../utils/data-validator');
const paymentUtils = require('../utils/payment-utils');

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const apiVersion = mainConf.apiVersion;

const DEF_CURRENCY = 'ARS';

const EMPTY_CALLBACK = function () { };

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
    if (!paymethod) return sendMsgCodeResponse(res, 'No se indico un metodo de pago', 400);

    const { waitTime, travelTime, totalTime = (waitTime + travelTime) } = trip;
    trip.totalTime = totalTime;

    const serverId = req.serverId;
    trip.applicationOwner = serverId;

    /* Intento obtener el currency del paymethod. Si no esta ahi, lo intento obtener del cost */
    const cost = trip.cost || { currency: DEF_CURRENCY };
    const currency = paymethod.currency || cost.currency;

    /* TODO : USAR EL API DE PAGOS PARA PAGAR EL VIAJE QUE SE ESTA DANDO DE ALTA */
    Trip.insert(trip, (err, dbTrip) => {
        if (err) return sendMsgCodeResponse(res, 'Error en la BBDD al insertar el viaje', 500);
        const { distance, passenger } = trip;

        estimatePromise(distance, passenger, currency)
            .then(result => {
                if (result.cannotTravel) return Promise.reject({ code: 400, message: 'El pasajero debe normalizar su situación de pago' });

                const metadata = { version: apiVersion };
                // si el viaje resulta gratis, no se efectua ningun pago y se responde al cliente   
                if (result.free) {
                    dbTrip.cost = { currency, value: 0 };
                    res.status(201);
                    return res.send({ metadata, trip: dbTrip });
                }

                /* Si el viaje no es gratis, calculo su costo */
                let amount = 0;
                result.operations.forEach(op => amount = op(amount));
                console.log('Total: ' + amount);

                // transactionId, currency, value, { parameters, paymethod }
                const transactionId = generateTransaction(trip);
                const paymentData = paymentUtils.buildPaymentData(transactionId, currency, amount, paymethod);

                return new Promise((resolve, reject) =>
                    paymentUtils.postPayment(paymentData, (err, payment) => {
                        payment.success = true;
                        if (err) {
                            console.error('Error en el pago');
                            console.error(err);
                            payment.success = false;
                        }
                        resolve(payment);
                    }));

            }).then(payment => {
                const metadata = { version: apiVersion };
                const { currency, value } = payment;
                const cost = { currency, value };
                dbTrip.cost = cost;

                //Se inserta una transaccion para el pasajero
                const transObj = {
                    id: payment.transaction_id, currency, value,
                    appusr: passenger, trip: dbTrip.id, done: payment.success
                };
                Transaction.insert(transObj, (err, dbTransaction) => {
                    if (err) {
                        console.error('Error al insertar transaccion');
                        console.error(err);
                    }
                    res.status(201);
                    return res.send({ metadata, trip: dbTrip });
                });
            })
            .catch(err => {
                console.error(err);
                Trip.delete(dbTrip, EMPTY_CALLBACK);
                const { code, message } = err;
                if (code && message) return sendMsgCodeResponse(res, message, code);
                sendMsgCodeResponse(res, 'Error en la BBDD al insertar el viaje', 500);
            });
    });
}

exports.postTrip = postTrip;

function generateTransaction({ distance, passenger }) {
    return `${passenger}-${distance}-${Date.now()}`;
}

function measureDistance(start, end) {
    const lat1 = start.address.location.lat;
    const lon1 = start.address.location.lon;
    const lat2 = end.address.location.lat;
    const lon2 = end.address.location.lon;
    return distanceMeasurer.distanceMt(lat1, lon1, lat2, lon2);
}

function getLast30MinsTrips(trips) {
    const minsGap = 1000 * 60 * 30;
    return trips.filter(trip => {
        const timeGap = Date.now() - new Date(trip.date).getTime();
        return timeGap < minsGap;
    });
}

function getTodayTrips(trips) {
    return trips.filter(trip => moment(trip.date).date() == moment().date());
}

function estimatePromise(distance, passenger, currency) {
    const fact = { type: 'passenger', mts: distance, operations: [], dayOfWeek: moment().day(), hour: moment().hour() };

    return new Promise((resolve, reject) => Trip.findByUser(passenger, (err, trips) => err ? reject(err) : resolve(trips)))
        .then(trips => {
            fact.tripCount = trips.length;
            fact.last30minsTripCount = getLast30MinsTrips(trips).length;
            fact.todayTripCount = getTodayTrips(trips).length;

            return new Promise((resolve, reject) =>
                ApplicationUser.findById(passenger, (err, user) => err ? reject(err) : resolve(user)));
        }).then(user => {
            if (!user) return Promise.reject({ code: 400, message: `El usuario ${passenger} no existe` });

            /* Si en el body del request se indica el cost entonces se toma el currency aqui para obtener el balance del usuario */
            fact.pocketBalance = user.getBalance(currency);
            fact.email = user.email;

            return new Promise((resolve, reject) =>
                Rule.findActive((err, rules) => err ? reject(err) : resolve(rules)));
        }).then(rules => {
            const jsonRules = rules.map(rule => rule.blob);
            return ruleHandler.checkFromJson(fact, jsonRules);
        });
}


exports.estimate = function (req, res) {
    const { start, end, passenger, distance, cost = { currency: DEF_CURRENCY, value: 0 } } = req.body;
    if (!passenger) return sendMsgCodeResponse(res, 'Falta parametro de pasajero', 400);
    if (!distance && (!start || !end)) return sendMsgCodeResponse(res, 'Faltan parametros para calcular distancia', 400);

    let mts;
    try {
        mts = distance || measureDistance(start, end);
        if (mts < 0) return sendMsgCodeResponse(res, 'Distancia invalida', 400);
    } catch (error) {
        return sendMsgCodeResponse(res, 'Error al obtener distancia de viaje', 400);
    }

    const currency = cost.currency;

    estimatePromise(mts, passenger, currency)
        .then(result => {
            if (result.cannotTravel) return Promise.reject({ code: 402, message: 'El pasajero debe normalizar su situación de pago' });

            const metadata = { version: apiVersion };
            if (result.free) return res.send({ metadata, cost: { currency, value: 0 } });

            let amount = 0;
            result.operations.forEach(op => {
                amount = op(amount);
                console.log('amount: ' + amount);
            });
            console.log('Total: ' + amount);
            return res.send({ metadata, cost: { currency, value: amount } });
        }).catch(err => {
            const { code, message } = err;
            if (code && message) return sendMsgCodeResponse(res, message, code);
            console.error(err);
            return sendMsgCodeResponse(res, 'Error en la BBDD al calcular el viaje', 500);
        });
};