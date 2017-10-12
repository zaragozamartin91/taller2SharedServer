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
function parse({ headers: { authorization } }) {
    console.log('authorization:');
    console.log(authorization);

    if (!authorization) return {};

    const part = authorization.replace(/basic +/gi, '');
    const auth = new Buffer(part, 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    return new BasicAuth(user, pass);
}

exports.parse = parse;