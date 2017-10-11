/**
 * Obtiene el token de un http request.
 * @param {Request} req Http request.
 * Token
 */
function getToken(req) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.toLowerCase().indexOf('bearer') >= 0) {
        return authHeader.replace(/Bearer +/ig, '');
    }
    else return req.body.token || req.query.token;
}

exports.getToken = getToken;