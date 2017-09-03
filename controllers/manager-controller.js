const BusinessUser = require('../model/BusinessUser');
const tokenManager = require('../utils/token-manager');
const mainConf = require('../config/main-config');
const moment = require('moment');
const basicAuthParser = require('../utils/basic-auth-parser');

const logger = require('log4js').getLogger('manager-controller');

function signUser(user) {
    const username = user.username;
    return tokenManager.signToken({ username });
}

exports.generateToken = function (req, res) {
    logger.debug('req.body:');
    logger.debug(req.body);
    
    const basicAuth = basicAuthParser.parse(req);
    const username = req.body.username || basicAuth.user;
    const password = req.body.password || basicAuth.pass;

    if (username && password) return BusinessUser.findByUsername(
        username, (err, user) => {
            if (err) {
                res.status(401);
                const message = 'No autorizado';
                const code = 0;
                return res.send({ code, message });
            }

            const authOk = user.authenticate(password);
            if (authOk) {
                const token = signUser(user);
                const version = mainConf.apiVersion;
                const metadata = { version };
                return res.send({ metadata, token });
            }
        });


    res.status(400);
    const message = 'Error en el request';
    const code = 0;
    return res.send({ code, message });
};