const axios = require('axios');
const responseUtils = require('../utils/response-utils');
const logger = require('log4js').getLogger('paymethods-controller');
const mainConf = require('../config/main-config');
const paymentUtils = require('../utils/payment-utils');

/* FIN DE IMPORTS --------------------------------------------------------------------------------------------------------- */

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

const API_VERSION = mainConf.apiVersion;

const TOKEN_HOLDER = paymentUtils.TOKEN_HOLDER;
const getTokenPromise = paymentUtils.getTokenPromise;
const paymethodsPromise = paymentUtils.paymethodsPromise;
const buildPaymethodsArray = paymentUtils.buildPaymethodsArray;
const getStatusCode = paymentUtils.getStatusCode;
const updateToken = paymentUtils.updateToken;

/* GET PAYMETHODS ------------------------------------------------------------------------------------------------------------- */

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