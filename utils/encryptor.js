const bcrypt = require('bcryptjs');

function encrypt(password) {
    return bcrypt.hashSync(password, 10);
}

function verify(hash, plainPassword) {
    const isValid = bcrypt.compareSync(plainPassword, hash);
    return isValid;
}

exports.encrypt = encrypt;
exports.verify = verify;