const axios = require('axios');
const logger = require('log4js').getLogger('paymethods-controller');
const mainConf = require('../config/main-config');

/* FIN DE IMPORTS --------------------------------------------------------------------------------------------------------- */

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


/* POST PAYMENT ------------------------------------------------------------------------------------------------------------- */

