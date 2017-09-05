const tokenManager = require('../utils/token-manager');
const responseUtils = require('../utils/response-utils');
const BusinessUser = require('../model/BusinessUser');
const Role = require('../model/Role');
const logger = require('log4js').getLogger('token-validator');

/**
 * Middleware que verifica la validez de un token api.
 * Este middleware debe setearse para interceptar las requests de los 
 * endpoints que utilizan seguridad de tipo token.
 * 
 */
exports.verifyToken = function (req, res, next) {
    logger.debug('Validando token de query');
    const token = req.body.token || req.query.token || req.header('x-token');
    if (token) {
        tokenManager.verifyToken(token, (err, decoded) => {
            if (err) return responseUtils.sendMsgCodeResponse(res, 'No autorizado', 401);

            req.decodedToken = decoded;
            next();
        });
    } else return responseUtils.sendMsgCodeResponse(res, 'Token no enviado', 400);
};

function verifyRoleToken(role) {
    return function (req, res, next) {
        logger.debug('Validando token de tipo manager');
        const decodedToken = req.decodedToken;
        const userId = decodedToken.id;
        if (!userId) return responseUtils.sendMsgCodeResponse(res, 'No autorizado', 401);

        BusinessUser.hasRole(userId, role, (err, hasRole) => {
            if (err) return responseUtils.sendMsgCodeResponse(res, `Ocurrio un error al verificar los roles de ${userId}`, 500);
            if (hasRole) return next();
            return responseUtils.sendMsgCodeResponse(res, `Usuario ${userId} no es manager`, 401);
        });
    };
}

exports.verifyRoleToken = verifyRoleToken;

exports.verifyManagerToken = verifyRoleToken(Role.manager());
exports.verifyAdminToken = verifyRoleToken(Role.admin());
exports.verifyUserToken = verifyRoleToken(Role.user());