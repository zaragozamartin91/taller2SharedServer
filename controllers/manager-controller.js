const BusinessUser = require('../model/BusinessUser');
const tokenManager = require('../utils/token-manager');

function signUser(user) {
    const username = user.username;
    return tokenManager.signToken({ username });
}

exports.generateToken = function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        BusinessUser.findByUsername(username, (err, user) => {
            if (err) {
                res.status(401);
                const message = 'No autorizado';
                return res.send({ message });
            }

            const authOk = user.authenticate(password);
            if (authOk) {
                const token = signUser(user);
                res.send({ token });
            }
        });
    } else {
        res.status(400);
        const message = 'Error en el request';
        res.send({ message });
    }
};