const mainConf = require('../config/main-config');
const responseUtils = require('../utils/response-utils');
const ApplicationServer = require('../model/ApplicationServer');
const CollectionMetadata = require('../model/CollectionMetadata');
const tokenManager = require('../utils/token-manager');

const logger = require('log4js').getLogger('manager-controller');

exports.getServers = function (req, res) {
    ApplicationServer.find((err, srvs) => {
        if (err) return responseUtils.sendErrResponse(res, 'Ocurrio un error al obtener los servers', 500);

        const count = srvs.length;
        const total = count;
        const metadata = new CollectionMetadata(
            count,
            total,
            '',
            '',
            '',
            '',
            mainConf.apiVersion
        );

        const servers = srvs.map(ApplicationServer.withTimestampFields);
        res.send({ metadata, servers });
    });
};

exports.postServer = function (req, res, next) {
    const servObj = req.body;
    if (!servObj.name || !servObj.createdBy) return responseUtils.sendErrResponse(
        res, 'Faltan campos', 400);

    ApplicationServer.insert(servObj, (err, result) => {
        if (err) return responseUtils.sendErrResponse(
            res, 'Ocurrio un error al dar de alta el server', 500);

        const metadata = mainConf.apiVersion;
        const server = result.withTimestampFields();
        const token = tokenManager.signToken({ id: server.id });
        res.send({ metadata, server, token });
    });
};