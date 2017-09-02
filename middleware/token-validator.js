const tokenManager = require('../utils/token-manager');

/**
 * Middleware que verifica la validez de un token api.
 * Este middleware debe setearse para interceptar las requests de los 
 * endpoints que utilizan seguridad de tipo token.
 * 
 */
exports.verifyToken = function (req, res, next) {
    const token = req.body.token || req.query.token || req.header('x-token');
    tokenManager.verifyToken(token, (err, decoded) => {
        if (err) {
            res.status(401);
            return res.send({ message: "Token invalido" });
        }

        req.decoded = decoded;
        next();
    });
};