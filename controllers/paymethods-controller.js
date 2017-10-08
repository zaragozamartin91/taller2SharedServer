const axios = require('axios');
const responseUtils = require('../utils/response-utils');
const logger = require('log4js').getLogger('paymethods-controller');

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

const DEF_CLIENT_ID = 'ee04c1bd-bd98-4ac9-861e-cff1834e0386';
const DEF_CLIENT_SECRET = '1e238cae-26ae-412d-a7e6-959e89980a13';
const TOKEN_HOLDER = {
    token: null
};
/* Se lee la url del api de pagos desde la variable de entorno PAYMENTS_API_URL o se asigna la de heroku por defecto */
const PAYMENTS_API_URL = process.env.PAYMENTS_API_URL || 'https://shielded-escarpment-27661.herokuapp.com/api/v1';
const AUTHORIZE_URL = PAYMENTS_API_URL + '/user/oauth/authorize';
const GET_PAYMENTS_URL = PAYMENTS_API_URL + '/paymethods';


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
        logger.debug('Renovando token ' + TOKEN_HOLDER.token);
        return authTokenPromise();
    }
    if (TOKEN_HOLDER.token) {
        logger.debug('Reutilizando token ' + TOKEN_HOLDER.token);
        return Promise.resolve({ data: { access_token: TOKEN_HOLDER.token } });
    }
}

function __getPaymethods(req, res, renew = false) {
    getTokenPromise().then(contents => {
        const token = contents.data.access_token;
        TOKEN_HOLDER.token = token;
        return paymethodsPromise(token);
    }).then(contents => {
        res.send(contents.data);
    }).catch(cause => {
        const statusCode = cause.request.res.statusCode;
        const unauthorized = statusCode == 403 || statusCode == 401;
        if (unauthorized) {
            logger.debug('Token invalido o expirado...');
            __getPaymethods(req, res, true);
        } else {
            sendMsgCodeResponse(res, '', statusCode);
        }
    });
}

exports.getPaymethods = function (req, res) {
    return __getPaymethods(req, res);
};