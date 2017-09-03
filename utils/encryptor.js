const bcrypt = require('bcryptjs');

/**
 * Encripta un password.
 * @param {string} password Clave en texto plano.
 * @return {string} Clave encriptada.
 */
function encrypt(password) {
    return bcrypt.hashSync(password, 10);
}

/**
 * Verifica una clave encriptada.
 * @param {string} hash Clave encriptada.
 * @param {string} plainPassword Clave en texto plano.
 * True si la clave es valida.
 */
function verify(hash, plainPassword) {
    const isValid = bcrypt.compareSync(plainPassword, hash);
    return isValid;
}

exports.encrypt = encrypt;
exports.verify = verify;