const assert = require('assert');
const serverController = require('../controllers/server-controller');
/* istanbul ignore next */
const dbManager = require('../model/db-manager');
const ApplicationServer = require('../model/ApplicationServer');
const TokenModel = require('../model/Token');
const tokenManager = require('../utils/token-manager');
const sinon = require('sinon');
const axios = require('axios');

let sandbox = null;

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. 

const serverMock1 = {
    'id': 'llevame',
    '_ref': 'b058892674142fdc93192438917d3fb87568efb0',
    'createdBy': 'martin',
    'createdTime': 1507059410810,
    'name': 'Llevame',
    'lastConnection': 1507070208147,
    'url': 'http://someurl.com/api/v1'
};

const serverMock2 = {
    'id': 'supermegataxi',
    '_ref': '5f5e656e1387c067c96a2458ba51738ed1a0bdb8',
    'createdBy': 'martin',
    'createdTime': 1507061025653,
    'name': 'Super mega Taxi',
    'lastConnection': 1507071823785,
    'url': ''
};

const serverInstanceMock1 = ApplicationServer.fromObj(serverMock1);
const serverInstanceMock2 = ApplicationServer.fromObj(serverMock2);

const serverInstanceMocks = [serverInstanceMock1, serverInstanceMock2].map(ApplicationServer.fromObj);

const insertedServerMock = ApplicationServer.buildServer({
    createdBy: serverMock1.createdBy,
    name: 'Inserted server mock 1'
});

const tokenMock1 = TokenModel.fromObj(tokenManager.signServer(insertedServerMock));

function mockTokens() {
    return [TokenModel.fromObj(tokenMock1)];
}

function mockErrRes(expectedCode) {
    return {
        status(code) { this.code = code; },
        send({ code, message }) {
            assert.ok(message);
            assert.equal(expectedCode, code);
        }
    };
}

describe('server-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getServer()', function () {
        it('Obtiene un server a partir de su id', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((server, callback) => callback(null, serverInstanceMock1));

            const req = {
                params: { serverId: serverMock1.id }
            };
            const res = {
                status(code) { this.code = code; },
                send({ metadata, server }) {
                    console.log(metadata);
                    assert.ok(metadata.version);
                    assert.equal(serverInstanceMock1, server);
                }
            };
            serverController.getServer(req, res);
        });

        it('Falla con error 404 dado que el server no existe', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((server, callback) => callback(null, null));

            const req = {
                params: { serverId: serverMock1.id }
            };
            const res = mockErrRes(404);
            serverController.getServer(req, res);
        });

        it('Falla con error 500 porque ocurre un error en la bbdd', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((server, callback) => callback(new Error('Error en la query')));

            const req = { params: { serverId: serverMock1.id } };
            const res = mockErrRes(500);
            serverController.getServer(req, res);
        });
    });


    describe('#getServers()', function () {
        it('Obtiene los servidores disponibles', function () {
            sandbox.stub(ApplicationServer, 'find')
                .callsFake(callback => callback(null, serverInstanceMocks));

            const req = {};
            const res = {
                send({ metadata, servers }) {
                    assert.equal(2, metadata.count);
                    assert.equal(2, metadata.total);
                    assert.equal(2, servers.length);
                }
            };
            serverController.getServers(req, res);
        });

        it('Falla con error 500 dado que ocurre un error', function () {
            sandbox.stub(ApplicationServer, 'find')
                .callsFake(callback => callback(new Error('Error al obtener los servidores')));

            const req = {};
            const res = mockErrRes(500);
            serverController.getServers(req, res);
        });
    });


    describe('#postServer()', function () {
        it('Falla debido a que faltan campos en el request', function () {
            const req = { body: { name: 'server' } };
            const res = mockErrRes(400);
            serverController.postServer(req, res);
        });

        it('Inserta un server nuevo exitosamente', function () {
            sandbox.stub(ApplicationServer, 'insert')
                .callsFake((servObj, callback) => callback(null, insertedServerMock));
            sandbox.stub(TokenModel, 'insert')
                .callsFake((token, servId, callback) => callback(null, tokenMock1));

            const req = { body: { name: 'server', createdBy: serverMock1.createdBy } };
            const res = {
                send({ metadata, server: { server, token } }) {
                    assert.ok(metadata.version);
                    assert.ok(server);
                    assert.ok(token);
                }
            };
            serverController.postServer(req, res);
        });

        it('Falla debido a un error en al bbdd', function () {
            sandbox.stub(ApplicationServer, 'insert')
                .callsFake((servObj, callback) => callback(new Error('Error en la query')));

            const req = { body: { name: 'server', createdBy: serverMock1.createdBy } };
            const res = mockErrRes(500);
            serverController.postServer(req, res);
        });

        it('Falla por un error al insertar el token', function () {
            const dbServer = ApplicationServer.fromObj(serverMock1);
            sandbox.stub(ApplicationServer, 'insert')
                .callsFake((servObj, callback) => callback(null, dbServer));
            sandbox.stub(TokenModel, 'insert')
                .callsFake((token, servId, callback) => callback(new Error('Error en la query')));

            const req = { body: { name: 'server', createdBy: serverMock1.createdBy } };
            const res = mockErrRes(500);
            serverController.postServer(req, res);
        });
    });

    describe('#deleteServer()', function () {
        it('Falla debido a que el server no existe', function () {
            sandbox.stub(ApplicationServer, 'delete')
                .callsFake((servId, callback) => callback());
            const req = { params: { serverId: serverInstanceMock1.id } };
            const res = mockErrRes(404);
            serverController.deleteServer(req, res);
        });

        it('Falla debido a un error en la bbdd', function () {
            sandbox.stub(ApplicationServer, 'delete')
                .callsFake((servId, callback) => callback(new Error('Error en la query')));
            const req = { params: { serverId: serverInstanceMock1.id } };
            const res = mockErrRes(500);
            serverController.deleteServer(req, res);
        });

        it('Elimina un server exitosamente', function () {
            sandbox.stub(ApplicationServer, 'delete')
                .callsFake((servId, callback) => callback(null, serverInstanceMock1));

            const req = { params: { serverId: serverInstanceMock1.id } };
            const res = mockErrRes(204);
            serverController.deleteServer(req, res);
        });
    });

    describe('#updateServer()', function () {
        it('Falla debido a que no existe el server a actualizar', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((servObj, callback) => callback(null, null));
            const req = { params: { serverId: 'fake id' } };
            const res = mockErrRes(404);
            serverController.updateServer(req, res);
        });

        it('Falla debido a una colision', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((servObj, callback) => callback(null, serverInstanceMock1));

            const { name } = serverInstanceMock1;
            const _ref = 'invalid ref';
            const req = {
                params: { serverId: serverInstanceMock1.id },
                body: { name, _ref }
            };
            const res = mockErrRes(409);
            serverController.updateServer(req, res);
        });

        it('Actualiza un server exitosamente', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((servObj, callback) => callback(null, ApplicationServer.fromObj(serverMock1)));
            sandbox.stub(ApplicationServer, 'update')
                .callsFake((servObj, callback) => callback(null, ApplicationServer.fromObj(servObj)));

            const { _ref } = serverInstanceMock1;
            const name = 'New name';
            const req = {
                params: { serverId: serverMock1.id },
                body: { name, _ref }
            };
            const res = {
                send({ metadata, server }) {
                    assert.ok(metadata.version);
                    assert.equal(name, server.name);
                }
            };
            serverController.updateServer(req, res);
        });

        it('Falla por un error en la bbdd al ejecutar update', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((servObj, callback) => callback(null, ApplicationServer.fromObj(serverMock1)));
            sandbox.stub(ApplicationServer, 'update')
                .callsFake((servObj, callback) => callback(new Error()));

            const { _ref } = serverInstanceMock1;
            const req = {
                params: { serverId: serverMock1.id },
                body: { _ref }
            };
            const res = mockErrRes(500);
            serverController.updateServer(req, res);
        });
    });

    describe('#resetToken()', function () {
        it('Invalida un token de servidor y genera uno nuevo', function () {
            sandbox.stub(TokenModel, 'invalidateTokensOwnedBy')
                .callsFake((serverId, callback) => callback(null, mockTokens()));
            sandbox.stub(TokenModel, 'insert')
                .callsFake((newToken, serverId, callback) => callback(null, newToken));

            const dbServer = ApplicationServer.fromObj(serverMock1);
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, dbServer));

            const newToken = tokenManager.signServer(dbServer);

            const req = { params: { serverId: serverMock1.id } };
            const res = {
                send({ metadata, server: { server, token } }) {
                    assert.ok(metadata.version);
                    assert.ok(server);
                    assert.ok(token);
                    assert.equal(newToken.token, token.token);
                }
            };

            serverController.resetToken(req, res);
        });

        it('Falla por un error en la bbdd', function () {
            sandbox.stub(TokenModel, 'invalidateTokensOwnedBy')
                .callsFake((serverId, callback) => callback(new Error()));

            const dbServer = ApplicationServer.fromObj(serverMock1);
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, dbServer));

            const req = { params: { serverId: serverMock1.id } };
            const res = mockErrRes(500);

            serverController.resetToken(req, res);
        });
    });

    describe('#renewToken', function () {
        it('No renueva un token si el mismo es valido', function () {
            const dbToken = tokenManager.signServer(serverInstanceMock1);
            sandbox.stub(TokenModel, 'findToken')
                .callsFake((token, callback) => callback(null, dbToken));

            const dbServer = ApplicationServer.fromObj(serverMock1);
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, dbServer));

            const now = new Date();
            sandbox.stub(ApplicationServer, 'updateLastConnection')
                .callsFake((serverId, callback) => {
                    dbServer.lastConnection = now;
                    callback(null, dbServer);
                });

            const req = {
                body: {}, query: { token: dbToken.token },
                header: function (type) {
                    return dbToken.token;
                }
            };
            const res = {
                send({ metadata, ping: { server, token } }) {
                    assert.ok(server);
                    assert.ok(token.token);
                    assert.equal(dbToken.expiresAt, token.expiresAt);
                    assert.equal(now.getTime(), dbServer.lastConnection);
                }
            };

            serverController.renewToken(req, res);
        });
    });

    describe('#pingServer', function () {
        it('Obtiene el estado de llevame', function () {
            sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { code: 200 } }));
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, serverMock1));

            const req = { params: { serverId: serverMock1.id } };
            const res = mockErrRes(200);
            serverController.pingServer(req, res);
        });

        it('Obtiene el estado de llevame con codigo ausente', function () {
            sandbox.stub(axios, 'get').returns(Promise.resolve({ data: {} }));
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, serverMock1));

            const req = { params: { serverId: serverMock1.id } };
            const res = mockErrRes(200);
            serverController.pingServer(req, res);
        });

        it('Falla al obtener el estado de llevame', function () {
            sandbox.stub(axios, 'get').returns(Promise.reject({ data: { code: 500 } }));
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, serverMock1));

            const req = { params: { serverId: serverMock1.id } };
            const res = mockErrRes(500);
            serverController.pingServer(req, res);
        });

        it('Obtiene el estado de otro server', function () {
            sandbox.stub(Math, 'random').returns(0.6);
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, serverMock2));

            const req = { params: { serverId: serverMock2.id } };
            const res = mockErrRes(200);
            serverController.pingServer(req, res);
        });

        it('Obtiene el estado de otro server como fallido', function () {
            sandbox.stub(Math, 'random').returns(0.4);
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(null, serverMock2));

            const req = { params: { serverId: serverMock2.id } };
            const res = mockErrRes(500);
            serverController.pingServer(req, res);
        });

        it('Falla porque ocurrio un error en la BBDD', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback(new Error('error')));

            const req = { params: { serverId: serverMock2.id } };
            const res = mockErrRes(500);
            serverController.pingServer(req, res);
        });

        it('Falla porque el server no existe', function () {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((serverId, callback) => callback());

            const req = { params: { serverId: serverMock2.id } };
            const res = mockErrRes(404);
            serverController.pingServer(req, res);
        });
    });
});


