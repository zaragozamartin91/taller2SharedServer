const ApplicationUser = require('../model/ApplicationUser');
const mainConf = require('../config/main-config');
const logger = require('log4js').getLogger('app-user-controller');
const responseUtils = require('../utils/response-utils');

const apiVersion = mainConf.apiVersion;
const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;

function buildMetadata(count = 0, total = count) {
    return {
        count,
        total,
        'next': '',
        'prev': '',
        'first': '',
        'last': '',
        'version': apiVersion
    };
}

exports.getUsers = function (req, res) {
    const serverId = req.serverId;

    function callback(err, users) {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los usuarios de ' + serverId, 500);
        const metadata = buildMetadata(users.length);
        res.send({ metadata, users });
    }

    /* Si serverId esta presente en el request quiere decir que se invoco esta funcion pasando un ApplicationToken.
    Caso contrario, se invoco usando un BusinessToken */
    if (serverId) return ApplicationUser.findByApp(serverId, callback);
    else return ApplicationUser.find(callback);
};