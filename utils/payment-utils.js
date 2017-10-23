const axios = require('axios');
const logger = require('log4js').getLogger('paymethods-controller');
const mainConf = require('../config/main-config');
const responseUtils = require('./response-utils');

/* FIN DE IMPORTS --------------------------------------------------------------------------------------------------------- */

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

const API_VERSION = mainConf.apiVersion;
const DEF_CLIENT_ID = 'ee04c1bd-bd98-4ac9-861e-cff1834e0386';
const DEF_CLIENT_SECRET = '1e238cae-26ae-412d-a7e6-959e89980a13';
const TOKEN_HOLDER = {
    token: '56a4sdas65d4ad654asd4a65sd4a6sd4asd'
};

exports.TOKEN_HOLDER = TOKEN_HOLDER;

/**
 * Actualiza el token de pago si es necesario.
 * @param {string} token Nuevo token de pago.
 * @return {string} Token de pago.
 */
function updateToken(token) {
    if (TOKEN_HOLDER.token != token) TOKEN_HOLDER.token = token;
    return TOKEN_HOLDER.token;
}

exports.updateToken = updateToken;

/* Se lee la url del api de pagos desde la variable de entorno PAYMENTS_API_URL o se asigna la de heroku por defecto */
const PAYMENTS_API_URL = mainConf.PAYMENTS_API_URL;
const AUTHORIZE_URL = PAYMENTS_API_URL + '/user/oauth/authorize';
const GET_PAYMENTS_URL = PAYMENTS_API_URL + '/paymethods';
const POST_PAYMENT_URL = PAYMENTS_API_URL + '/payments';

/* GET PAYMETHODS ------------------------------------------------------------------------------------------------------------- */

/**
 * Construye una promesa para obtener los metodos de pago.
 * @param {string} token Token de autenticacion con el api de pagos.
 * @return {Promise} Promesa para obtener los metodos de pago
 */
function paymethodsPromise(token = TOKEN_HOLDER.token) {
    return axios.get(GET_PAYMENTS_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}

exports.paymethodsPromise = paymethodsPromise;

function authTokenPromise(client_id = DEF_CLIENT_ID, client_secret = DEF_CLIENT_SECRET) {
    return axios.post(AUTHORIZE_URL, { client_id, client_secret });
}

function getTokenPromise(renew = false) {
    if (renew || !TOKEN_HOLDER.token) {
        logger.debug('Renovando token');
        return authTokenPromise();
    }

    logger.debug('Reutilizando token ' + TOKEN_HOLDER.token);
    return Promise.resolve({ data: { access_token: TOKEN_HOLDER.token } });
}

exports.getTokenPromise = getTokenPromise;

/**
 * Crea un arreglo con los metodos de pago.
 * @param {any} items Arreglo de metodos de pago obtenido del api de pagos.
 * @return {Array} Arreglo de metodos de pago.
 */
function buildPaymethodsArray(items = []) {
    return items.map(item => { return { name: item.paymethod, parameters: item.parameters }; });
}

exports.buildPaymethodsArray = buildPaymethodsArray;

/**
 * Obtiene el codigo de error de una causa de error en axios.
 * Considera que el objeto causa tiene la siguiente estructura: 
 * { request: { res: { statusCode } } }.
 * @param {any} cause Causa de un error.
 * @return {number} Codigo de error. 500 como valor por defecto. 
 */
function getStatusCode({ request: { res: { statusCode = 500 } = {} } = {} } = {}) {
    return statusCode;
}

exports.getStatusCode = getStatusCode;


function buildMetadata(count, total = count) {
    return { count, total, next: '', prev: '', first: '', last: '', version: API_VERSION };
}

/**
 * [PRIVADO]
 * Obtiene los metodos de pago.
 * @param {Request} req Http request.
 * @param {Response} res Http response.
 * @param {Boolean} renewToken [OPCIONAL] indica si se debe renovar el token de autenticacion.
 */
function __getPaymethods(req, res, renewToken = false) {
    getTokenPromise(renewToken).then(contents => {
        const token = contents.data.access_token;
        updateToken(token);
        return paymethodsPromise(token);
    }).then(contents => {
        const items = contents.data.items || [];
        const metadata = buildMetadata(items.length);
        const paymethods = buildPaymethodsArray(items);
        res.send({ metadata, paymethods });
    }).catch(cause => {
        const statusCode = getStatusCode(cause);
        const unauthorized = statusCode == 403 || statusCode == 401;
        if (unauthorized) {
            logger.debug('Token invalido o expirado...');
            __getPaymethods(req, res, true);
        } else {
            sendMsgCodeResponse(res, 'Error al obtener los medios de pago', statusCode);
        }
    });
}

exports.getPaymethods = function (req, res) {
    return __getPaymethods(req, res);
};


/* PERFORM PAYMENT ------------------------------------------------------------------------------------------------------------- */

function paymentPromise(token = TOKEN_HOLDER.token, paymentData) {
    try {
        console.log(paymentData);
        return axios.post(POST_PAYMENT_URL, paymentData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error(error);
        return Promise.reject({ code: 500, message: 'Estructura de pago incorrecta' });
    }
}

function __postPayment(req, res, paymentData, renewToken = false) {
    getTokenPromise(renewToken).then(contents => {
        const token = contents.data.access_token;
        updateToken(token);
        return paymentPromise(token, paymentData);
    }).then(contents => {
        res.send(contents.data);
    }).catch(cause => {
        const { code, message } = cause;
        if (code && message) return sendMsgCodeResponse(res, message, code);

        console.error(cause);

        const statusCode = getStatusCode(cause);
        const unauthorized = statusCode == 403 || statusCode == 401;
        if (unauthorized) {
            logger.debug('Token invalido o expirado...');
            __postPayment(req, res, paymentData, true);
        } else {
            sendMsgCodeResponse(res, 'Error al realizar el pago', statusCode);
        }
    });
}

exports.postPayment = function (req, res, paymentData) {
    return __postPayment(req, res, paymentData);
};