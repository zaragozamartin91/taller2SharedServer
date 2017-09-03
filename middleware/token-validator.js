const tokenManager = require('../utils/token-manager');
const responseUtils = require('../utils/response-utils');

/**
 * Middleware que verifica la validez de un token api.
 * Este middleware debe setearse para interceptar las requests de los 
 * endpoints que utilizan seguridad de tipo token.
 * 
 */
exports.verifyToken = function (req, res, next) {
    const token = req.body.token || req.query.token || req.header('x-token');
    if (token) {
        tokenManager.verifyToken(token, (err, decoded) => {
            if (err) return responseUtils.sendErrResponse(res, 'No autorizado', 401);

            req.decoded = decoded;
            next();
        });
    } else return responseUtils.sendErrResponse(res, 'Token no enviado', 400);
};