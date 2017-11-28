const BusinessUser = require('../model/BusinessUser');
const tokenManager = require('../utils/token-manager');
const mainConf = require('../config/main-config');
const basicAuthParser = require('../utils/basic-auth-parser');
const responseUtils = require('../utils/response-utils');
const TokenModel = require('../model/Token');

const logger = require('log4js').getLogger('token-controller');

function signUser(user) {
    const id = user.id;
    const username = user.username;
    return tokenManager.signToken({ id, username });
}

/**
 * Genera un token de usuarios de negocio
 */
exports.generateToken = function (req, res) {
    logger.debug('req.body:');
    logger.debug(req.body);

    const basicAuth = basicAuthParser.parse(req);
    const username = req.body.username || basicAuth.user;
    const password = req.body.password || basicAuth.pass;

    const backoffice = req.body.backoffice;

    if (username && password) return BusinessUser.findByUsername(
        username, (err, user) => {
            if (err) return responseUtils.sendMsgCodeResponse(res, 'Error al buscar el usuario', 500);
            if (!user) return responseUtils.sendMsgCodeResponse(res, `El usuario ${username} no existe`, 400);

            const authOk = user.authenticate(password);
            if (authOk) {
                const token = signUser(user);
                const version = mainConf.apiVersion;
                const metadata = { version };

                if (backoffice) {
                    logger.debug('LLamada desde backoffice detectada. Estableciendo cookie: ' + token.token);
                    const expires = new Date(Date.now() + 1000 * 60 * 15);
                    res.cookie('token', token.token, { expires });
                }

                return res.send({ metadata, token });
            } else return responseUtils.sendMsgCodeResponse(res, 'No autorizado', 401);
        });


    responseUtils.sendMsgCodeResponse(res, 'Request incompleto', 400);
};

exports.getLlevame = function (req, res) {
    console.log(req.header('Authorization'));
    TokenModel.findByOwner('llevame', (err, token) => {
        token = token || {};
        res.send(token);
    });
};

/**
 * Obtiene el token de un servidor particular.
 */
exports.getServerToken = function (req, res) {
    const serverId = req.params.serverId;
    TokenModel.findByOwner(serverId, (err, token) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, err.message, 500);
        if (!token) return responseUtils.sendMsgCodeResponse(res, 'Token no encontrado', 404);
        res.send(token);
    });
};