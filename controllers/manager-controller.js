const BusinessUser = require('../model/BusinessUser');
const tokenManager = require('../utils/token-manager');
const mainConf = require('../config/main-config');
const moment = require('moment');
const basicAuthParser = require('../utils/basic-auth-parser');
const responseUtils = require('../utils/response-utils');

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
            if (err) return responseUtils.sendErrResponse(res, 'Error al buscar el usuario', 500);

            const authOk = user.authenticate(password);
            if (authOk) {
                const token = signUser(user);
                const version = mainConf.apiVersion;
                const metadata = { version };
                return res.send({ metadata, token });
            } else return responseUtils.sendErrResponse(res, 'No autorizado', 401);
        });


    responseUtils.sendErrResponse(res, 'Request incompleto', 400);
};

exports.getServers = function (req, res) {
    res.send([1, 2, 3]);
};

exports.postServer = function (req, res, next) {

};