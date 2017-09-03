/**
 * Crea una referencia de datos basic auth.
 * 
 * @constructor
 * @this {BasicAuth}
 * @param {string} user Usuario.
 * @param {string} pass Password.
 * @return {BasicAuth} Nueva referencia de autenticacion.
 */
function BasicAuth(user, pass) {
    this.user = user;
    this.pass = pass;
}

/**
 * Parsea un http request y obtiene datos de autenticacion del encabezado 
 * considerando el metodo basic auth.
 * @param {Request} req Http request.
 * @return {BasicAuth} Datos de autenticacion.
 */
function parse(req) {
    const authorization = req.headers.authorization;
    if (authorization) {
        const parts = authorization.split(' ');
        const auth = new Buffer(parts[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        return new BasicAuth(user, pass);
    } else return {};
}

exports.parse = parse;