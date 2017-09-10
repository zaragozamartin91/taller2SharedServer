const mainConf = require('../config/main-config');
const responseUtils = require('../utils/response-utils');
const ApplicationServer = require('../model/ApplicationServer');
const CollectionMetadata = require('../model/CollectionMetadata');
const tokenManager = require('../utils/token-manager');
const BusinessUser = require('../model/BusinessUser');

const logger = require('log4js').getLogger('server-controller');

const apiVersion = mainConf.apiVersion;

exports.getServer = function (req, res) {
    const serverId = req.params.serverId;
    ApplicationServer.findById(serverId, (err, server) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, `Error al obtener el server ${serverId}`, 500);
        if (!server) return responseUtils.sendMsgCodeResponse(res, `Server ${serverId} no encontrado`, 404);

        const metadata = apiVersion;
        res.send({ metadata, server: server.withTimestampFields() });
    });
};

exports.getServers = function (req, res) {
    ApplicationServer.find((err, srvs) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, 'Ocurrio un error al obtener los servers', 500);

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

exports.postServer = function (req, res) {
    const servObj = req.body;
    if (!servObj.name || !servObj.createdBy) return responseUtils.sendMsgCodeResponse(res, 'Faltan campos', 400);

    ApplicationServer.insert(servObj, (err, result) => {
        if (err) {
            logger.error(err);
            return responseUtils.sendMsgCodeResponse(res, 'Ocurrio un error al dar de alta el server', 500);
        }

        const metadata = mainConf.apiVersion;
        const server = result.withTimestampFields();
        const token = tokenManager.signToken({ id: server.id });
        res.send({ metadata, server, token });
    });
};

exports.deleteServer = function (req, res) {
    const serverId = req.params.serverId;
    if (!serverId) return responseUtils.sendMsgCodeResponse(res, 'No se indico un server a eliminar', 400);

    ApplicationServer.delete(serverId, (err, server) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, 'Ocurrio un error al eliminar el server', 500);
        logger.debug(server);
        if (!server) return responseUtils.sendMsgCodeResponse(res, 'No existe el servidor buscado', 404);
        return responseUtils.sendMsgCodeResponse(res, 'Baja correcta', 200);
    });
};

exports.updateServer = function (req, res) {
    const serverId = req.params.serverId;
    if (!serverId) return responseUtils.sendMsgCodeResponse(res, 'No se indico un server a actualizar', 400);

    ApplicationServer.findById(serverId, (err, server) => {
        if (!server) return responseUtils.sendMsgCodeResponse(res, 'No existe el servidor buscado', 404);

        /* La actualizacion implica modificar el nombre del server. Si no se asigno un nombre nuevo en el body del request,
        entonces la actualizacion no tendra efecto */
        server.name = req.body.name || server.name;
        ApplicationServer.update(server, err => {
            if (err) return responseUtils.sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el server', 500);
            responseUtils.sendMsgCodeResponse(res, 'Modificacion correcta', 200);
        });
    });
};