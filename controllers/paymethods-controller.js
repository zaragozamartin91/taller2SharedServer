const axios = require('axios');
const responseUtils = require('../utils/response-utils');
const logger = require('log4js').getLogger('paymethods-controller');
const mainConf = require('../config/main-config');

/* FIN DE IMPORTS --------------------------------------------------------------------------------------------------------- */

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

const API_VERSION = mainConf.apiVersion;
const DEF_CLIENT_ID = 'ee04c1bd-bd98-4ac9-861e-cff1834e0386';
const DEF_CLIENT_SECRET = '1e238cae-26ae-412d-a7e6-959e89980a13';
const TOKEN_HOLDER = {
    token: '56a4sdas65d4ad654asd4a65sd4a6sd4asd'
};
/* Se lee la url del api de pagos desde la variable de entorno PAYMENTS_API_URL o se asigna la de heroku por defecto */
const PAYMENTS_API_URL = process.env.PAYMENTS_API_URL || 'https://shielded-escarpment-27661.herokuapp.com/api/v1';
const AUTHORIZE_URL = PAYMENTS_API_URL + '/user/oauth/authorize';
const GET_PAYMENTS_URL = PAYMENTS_API_URL + '/paymethods';

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

function buildMetadata(count, total = count) {
    return { count, total, next: '', prev: '', first: '', last: '', version: API_VERSION };
}

/**
 * Crea un arreglo con los metodos de pago.
 * @param {any} items Arreglo de metodos de pago obtenido del api de pagos.
 * @return {Array} Arreglo de metodos de pago.
 */
function buildPaymethodsArray(items = []) {
    return items.map(item => { return { name: item.paymethod, parameters: item.parameters }; });
}

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
        TOKEN_HOLDER.token = token;
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