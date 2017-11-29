const mainConf = require('../config/main-config');
const responseUtils = require('../utils/response-utils');
const ApplicationServer = require('../model/ApplicationServer');
const tokenManager = require('../utils/token-manager');
const BusinessUser = require('../model/BusinessUser');
const ApplicationUser = require('../model/ApplicationUser');
const TokenModel = require('../model/Token');
const axios = require('axios');

const logger = require('log4js').getLogger('server-controller');

const apiVersion = mainConf.apiVersion;
const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const buildMetadata = responseUtils.buildMetadata;
const requestTokenGetter = require('../utils/request-token-getter');

const getToken = requestTokenGetter.getToken;


exports.getServer = function (req, res) {
    getServer(req, res, server => {
        const metadata = { version: apiVersion };
        res.send({ metadata, server: server.withTimestampFields() });
    });
};

function getServer(req, res, callback) {
    const serverId = req.params.serverId;
    ApplicationServer.findById(serverId, (err, server) => {
        if (err) return sendMsgCodeResponse(res, `Error al obtener el server ${serverId}`, 500);
        if (!server) return sendMsgCodeResponse(res, `Server ${serverId} no encontrado`, 404);

        callback(server);
    });
}

exports.getServers = function (req, res) {
    ApplicationServer.find((err, srvs) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al obtener los servers', 500);

        const count = srvs.length;
        const total = count;
        const metadata = buildMetadata(count, total);

        const servers = srvs.map(ApplicationServer.withTimestampFields);
        res.send({ metadata, servers });
    });
};

exports.postServer = function (req, res) {
    const servObj = req.body;
    if (!servObj.name || !servObj.createdBy) return sendMsgCodeResponse(res, 'Faltan campos', 400);

    ApplicationServer.insert(servObj, (err, result) => {
        if (err) {
            logger.error(err);
            return sendMsgCodeResponse(res, 'Ocurrio un error al dar de alta el server', 500);
        }

        const metadata = { version: apiVersion };
        const server = result.withTimestampFields();
        const token = tokenManager.signServer(server);
        TokenModel.insert(token, server.id, (err, dbtoken) => {
            if (err) return sendMsgCodeResponse(res, 'Error al insertar el token del nuevo server', 500);
            res.send({ metadata, server: { server, token } });
        });
    });
};

exports.deleteServer = function (req, res) {
    const serverId = req.params.serverId;

    ApplicationServer.delete(serverId, (err, server) => {
        if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al eliminar el server', 500);
        if (!server) return sendMsgCodeResponse(res, 'No existe el servidor buscado', 404);
        return sendMsgCodeResponse(res, 'Baja correcta', 204);
    });
};

exports.updateServer = function (req, res) {
    const serverId = req.params.serverId;

    ApplicationServer.findById(serverId, (err, server) => {
        if (!server) return sendMsgCodeResponse(res, 'No existe el servidor buscado', 404);

        const { name, _ref, oldRef = _ref } = req.body;
        if (oldRef != server._ref) return sendMsgCodeResponse(res, 'Ocurrio una colision', 409);

        /* La actualizacion implica modificar el nombre del server. Si no se asigno un nombre nuevo en el body del request,
        entonces la actualizacion no tendra efecto */
        server.name = name || server.name;
        ApplicationServer.update(server, (err, updatedServer) => {
            if (err) return sendMsgCodeResponse(res, 'Ocurrio un error al actualizar el server', 500);
            const metadata = { version: apiVersion };
            res.send({ metadata, server: updatedServer.withTimestampFields() });
        });
    });
};

exports.resetToken = function (req, res) {
    getServer(req, res, server => {
        const serverId = server.id;
        TokenModel.invalidateTokensOwnedBy(serverId, (err, tokens) => {
            if (err) return sendMsgCodeResponse(res, 'Error al invalidar tokens del servidor', 500);

            logger.debug('Tokens invalidados:');
            logger.debug(tokens);

            const newToken = tokenManager.signServer(server);
            TokenModel.insert(newToken, serverId, (err, dbToken) => {
                if (err) return sendMsgCodeResponse(res, 'Error al insertar nuevo token en server', 500);

                logger.debug(`Token asignado a ${serverId}:`);
                logger.debug(dbToken);
                const metadata = { version: apiVersion };
                res.send({ metadata, server: { server: server.withTimestampFields(), token: dbToken.withTimestampExpiration() } });
            });
        });
    });
};

exports.renewToken = function (req, res) {
    const token = getToken(req);

    TokenModel.findToken(token, (err, dbToken) => {
        if (err) return sendMsgCodeResponse(res, 'Error al validar el token', 500);
        if (!dbToken) return sendMsgCodeResponse(res, 'No autorizado', 401);

        /* Si el token existe en la BBDD entonces es valido. Pero puede estar expirado */
        tokenManager.verifyToken(dbToken, (err, decoded) => {
            /* Si ocurrio un error entonces el token habia expirado */
            if (err) {
                const owner = dbToken.owner;
                ApplicationServer.findById(owner, (err, server) => {
                    if (err) return sendMsgCodeResponse(res, 'Error al obtener el servidor', 500);
                    if (!server) return sendMsgCodeResponse(res, 'El servidor ya no existe', 404);

                    TokenModel.invalidate(dbToken, err => {
                        if (err) return sendMsgCodeResponse(res, 'Error al invalidar el viejo token', 500);

                        const newToken = tokenManager.signServer(server);
                        TokenModel.insert(newToken, owner, (err, newDbToken) => {
                            if (err) return sendMsgCodeResponse(res, 'Error al renovar el token', 500);

                            ApplicationServer.updateLastConnection(server, (err, updatedServer) => {
                                const metadata = { version: apiVersion };
                                const ping = { server: updatedServer.withTimestampFields(), token: newDbToken.withTimestampExpiration() };
                                res.send({ metadata, ping });
                            });
                        });
                    });
                });
            } else {
                const serverId = decoded.id;
                ApplicationServer.findById(serverId, (err, server) => {
                    if (err) return sendMsgCodeResponse(res, 'Error al obtener el servidor', 500);
                    if (!server) return sendMsgCodeResponse(res, 'El servidor ya no existe', 404);

                    ApplicationServer.updateLastConnection(server, (err, updatedServer) => {
                        const metadata = { version: apiVersion };
                        const ping = { server: updatedServer.withTimestampFields(), token: dbToken.withTimestampExpiration().withoutOwner() };
                        res.send({ metadata, ping });
                    });
                });
            }
        });
    });
};


exports.pingServer = function (req, res) {
    const serverId = req.params.serverId;
    ApplicationServer.findById(serverId, (err, server) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el servidor ' + serverId, 500);
        if (!server) return sendMsgCodeResponse(res, `El server ${serverId} no existe`, 404);

        if (server.url) {
            axios.get(`${server.url}/keepalive`)
                .then(contents => sendMsgCodeResponse(res, contents.data.code || 'OK', 200))
                .catch(err => sendMsgCodeResponse(res, err.message || 'Error al verificar el estado de ' + serverId, 500));
        } else {
            const serverOk = Math.random() >= 0.5;
            if (serverOk) sendMsgCodeResponse(res, 'OK', 200);
            else sendMsgCodeResponse(res, `Servidor ${serverId} inactivo`, 500);
        }
    });

    /*
        if (serverId == 'llevame') {
            axios.get('http://taller2-application-server.herokuapp.com/api/v1/keepalive')
                .then(contents => sendMsgCodeResponse(res, contents.data.code || 'OK', 200))
                .catch(err => sendMsgCodeResponse(res, err.message || 'Error al verificar el estado de llevame', 500));
        } else {
            const serverOk = Math.random() >= 0.5;
            if (serverOk) sendMsgCodeResponse(res, 'OK', 200);
            else sendMsgCodeResponse(res, `Servidor ${serverId} inactivo`, 500);
        }
        */
};


exports.getFrequentPassengers = function (req, res) {
    const serverId = req.params.serverId;
    ApplicationUser.findFreqPassengers(serverId, (err, rows) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener los pasajeros frecuentes de ' + serverId, 500);
        res.send(rows);
    });
};