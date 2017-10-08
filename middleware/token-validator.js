const tokenManager = require('../utils/token-manager');
const responseUtils = require('../utils/response-utils');
const BusinessUser = require('../model/BusinessUser');
const Role = require('../model/Role');
const TokenModel = require('../model/Token');
const logger = require('log4js').getLogger('token-validator');


const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

function getToken(req) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.toLowerCase().indexOf('bearer') >= 0) {
        return authHeader.replace(/Bearer +/ig, '');
    }
    else return req.body.token || req.query.token;
}

/**
 * Middleware que verifica la validez de un token api.
 * Este middleware debe setearse para interceptar las requests de los 
 * endpoints que utilizan seguridad de tipo token.
 * 
 */
exports.verifyToken = function (req, res, next) {
    logger.debug('Verificando token de query');
    const token = getToken(req);
    if (!token) return sendMsgCodeResponse(res, 'Token no enviado', 400);

    tokenManager.verifyToken(token, (err, decoded) => {
        if (err) return sendMsgCodeResponse(res, 'No autorizado', 401);
        logger.debug(`Token ${token} valido!`);
        req.decodedToken = decoded;
        next();
    });
};

function verifyRoleToken(role) {
    return function (req, res, next) {
        logger.debug(`Validando token de tipo ${role.type}`);
        const decodedToken = req.decodedToken;
        const userId = decodedToken.id;
        if (!userId) return sendMsgCodeResponse(res, 'No autorizado', 401);

        BusinessUser.hasRole(userId, role, (err, hasRole) => {
            if (err) {
                logger.debug(err);
                return sendMsgCodeResponse(res, `Ocurrio un error al verificar los roles de ${userId}`, 500);
            }
            if (hasRole) {
                req.userId = userId;
                logger.debug(`usuario ${userId} ES ${role.type}`);
                return next();
            }
            logger.debug(`usuario ${userId} NO ES ${role.type}`);
            return sendMsgCodeResponse(res, `Usuario ${userId} no es ${role.type}`, 401);
        });
    };
}

function verifyServerToken(req, res, next) {
    const decodedToken = req.decodedToken;
    const serverId = decodedToken.id;
    if (!serverId) return sendMsgCodeResponse(res, 'No autorizado', 401);

    TokenModel.findByOwner(serverId, (err, token) => {
        if (err) return sendMsgCodeResponse(res, `Ocurrio un error al verificar el token de ${serverId}`, 500);
        if (token) {
            req.serverId = serverId;
            return next();
        }
        logger.debug('Token no encontrado en registro de tokens de app servers');
        return sendMsgCodeResponse(res, 'No autorizado', 401);
    });
}

function verifyServerOrUserToken(req, res, next) {
    const decodedToken = req.decodedToken;
    const userId = decodedToken.id;
    if (!userId) return sendMsgCodeResponse(res, 'No autorizado', 401);

    const role = 'user';

    BusinessUser.hasRole(userId, role, (err, hasRole) => {
        if (hasRole) {
            req.userId = userId;
            return next();
        }
        logger.debug(`usuario ${userId} NO ES ${role}`);
        return verifyServerToken(req, res, next);
    });
}

exports.verifyRoleToken = verifyRoleToken;

exports.verifyManagerToken = verifyRoleToken(Role.manager());
exports.verifyAdminToken = verifyRoleToken(Role.admin());
exports.verifyUserToken = verifyRoleToken(Role.user());

exports.verifyServerToken = verifyServerToken;
exports.verifyServerOrUserToken = verifyServerOrUserToken;