const assert = require('assert');
const appUserController = require('../controllers/app-user-controller');

const dbManager = require('../model/db-manager');
const ApplicationServer = require('../model/ApplicationServer');
const ApplicationUser = require('../model/ApplicationUser');
const TokenModel = require('../model/Token');
const tokenManager = require('../utils/token-manager');
const sinon = require('sinon');

let sandbox = null;

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests.

const userMock1 = {
    'id': 'mzaragoza',
    '_ref': '51b53d3b2200286d9711386132129e20b06c38f8',
    'applicationOwner': 'llevame',
    'type': 'driver',
    'cars': [
        {
            'id': 1,
            '_ref': '81b29f5aaa5570552e6a5e124fb4ec42b1c0d4ff',
            'owner': 'mzaragoza',
            'properties': [
                {
                    'name': 'model',
                    'value': 'renault'
                },
                {
                    'name': 'year',
                    'value': 2001
                }
            ]
        }
    ],
    'username': 'mzaragoza',
    'name': 'Martin',
    'surname': 'Zaragoza',
    'country': 'Argentina',
    'email': 'mzaragoza@accusys.com',
    'birthdate': '1991-03-21T03:00:00.000Z',
    'images': [
        'https://www.postgresql.org/docs/9.6/static/datatype-json.html'
    ],
    'balance': [
        {
            'currency': 'peso',
            'value': 123.45
        },
        {
            'currency': 'dolar',
            'value': 6789.1
        }
    ]
};

const userMock2 = {
    'id': 'quelopario',
    '_ref': '6b868e317825e0ecbac97721009f91907eb7aa65',
    'applicationOwner': 'llevame',
    'type': 'client',
    'cars': [],
    'username': 'quelopario',
    'name': 'Hector',
    'surname': 'Zaragoza',
    'country': 'Argentina',
    'email': 'quelopario@gmail.com',
    'birthdate': '1960-09-18T03:00:00.000Z',
    'images': [
        'https://www.postgresql.org/docs/9.6/static/datatype-json.html',
        'https://docs.google.com/document/d/1Ekd8ohj2WdSd5gg4_s4SGvP3P65CLb69U4-5fMBab4o/'
    ],
    'balance': [
        {
            'currency': 'peso',
            'value': 5000
        },
        {
            'currency': 'euro',
            'value': 45678.98
        }
    ]
};

const userMock3 = {
    'id': 'efidalgo',
    '_ref': '8ca7c4fea4ce993211636c3a82aa0e206f498b56',
    'applicationOwner': 'supertaxi',
    'type': 'driver',
    'cars': [
        {
            'id': 2,
            '_ref': 'becf9f9d53673f8329629e2cb19d4eeffb4c63c4',
            'owner': 'efidalgo',
            'properties': [
                {
                    'name': 'model',
                    'value': 'ford'
                },
                {
                    'name': 'year',
                    'value': 2007
                }
            ]
        }
    ],
    'username': 'efidalgo',
    'name': 'Exequiel',
    'surname': 'Fidalgo',
    'country': 'Argentina',
    'email': 'efidalgo_123@accusys.com',
    'birthdate': '1991-06-17T03:00:00.000Z',
    'images': [],
    'balance': [
        {
            'currency': 'peso',
            'value': 6789
        },
        {
            'currency': 'dolar',
            'value': 123321
        }
    ]
};

const userMock4 = {
    'id': 'rhuber',
    '_ref': 'd3949166201df5b084887c6cedcb70c936dc5ce7',
    'applicationOwner': 'supertaxi',
    'type': 'client',
    'cars': [],
    'username': 'rhuber',
    'name': 'Rolando',
    'surname': 'Huber',
    'country': 'Argentina',
    'email': 'rhuber@gmail.com',
    'birthdate': '1993-10-01T03:00:00.000Z',
    'images': [
        'https://www.postgresql.org/docs/9.6/static/datatype-json.html',
        'https://docs.google.com/document/d/1Ekd8ohj2WdSd5gg4_s4SGvP3P65CLb69U4-5fMBab4o/'
    ],
    'balance': [
        {
            'currency': 'peso',
            'value': 1111
        }
    ]
};

const serverMock1 = {
    'id': 'llevame',
    '_ref': 'b058892674142fdc93192438917d3fb87568efb0',
    'createdBy': 'martin',
    'createdTime': 1507059410810,
    'name': 'Llevame',
    'lastConnection': 1507070208147
};

const serverMock2 = {
    'id': 'supertaxi',
    '_ref': '7b2630f63d8ea0210618af3ecc761e343a1a7613',
    'createdBy': 'martin',
    'createdTime': 1507153146049,
    'name': 'Super Taxi',
    'lastConnection': 1507163945586
};

function mockTokens() {
    return [TokenModel.fromObj(tokenMock1)];
}

const mockUsers1 = () => [userMock1, userMock2].map(ApplicationUser.fromObj);
const mockUsers2 = () => [userMock3, userMock4].map(ApplicationUser.fromObj);

function mockErrRes(expectedCode) {
    return {
        status(code) { this.code = code; },
        send({ code, message }) {
            assert.ok(message);
            assert.equal(expectedCode, code);
        }
    };
}

describe('app-user-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getUsers', function () {
        it('Falla porque ocurre un error en la bbdd', function () {
            sandbox.stub(ApplicationUser, 'findByApp')
                .callsFake((serverId, callback) => callback(new Error()));
            const req = { serverId: serverMock1.id };
            const res = mockErrRes(500);
            appUserController.getUsers(req, res);
        });

        it('Obtiene los usuarios por aplicacion', function () {
            const dbUsers = mockUsers1();
            sandbox.stub(ApplicationUser, 'findByApp')
                .callsFake((serverId, callback) => callback(null, dbUsers));

            const req = { serverId: serverMock1.id };
            const res = {
                send({ metadata, users }) {
                    assert.equal(dbUsers.length, metadata.total);
                    assert.equal(users.length, metadata.total);
                }
            };

            appUserController.getUsers(req, res);
        });

        it('Obtiene todos los usuarios de aplicacion', function () {
            const dbUsers = [...mockUsers1(), ...mockUsers2()];
            sandbox.stub(ApplicationUser, 'find')
                .callsFake(callback => callback(null, dbUsers));

            const req = {};
            const res = {
                send({ metadata, users }) {
                    assert.equal(dbUsers.length, metadata.total);
                    assert.equal(users.length, metadata.total);
                }
            };

            appUserController.getUsers(req, res);
        });
    });

    describe('#getUser', function () {
        it('Falla debido a que el usuario no existe', function () {
            sandbox.stub(ApplicationUser, 'findByIdAndApp')
                .callsFake((userId, serverId, callback) => callback());

            const req = { serverId: serverMock1.id, params: { userId: userMock1.id } };
            const res = mockErrRes(404);
            appUserController.getUser(req, res);
        });

        it('Falla por un error en al bbdd', function () {
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((userId, callback) => callback(new Error()));

            const req = { params: { userId: userMock1.id } };
            const res = mockErrRes(500);
            appUserController.getUser(req, res);
        });

        it('Encuentra al usuario', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((userId, callback) => callback(null, dbUser));

            const req = { params: { userId: userMock1.id } };
            const res = {
                send({ metadata, user }) {
                    assert.ok(metadata);
                    assert.equal(dbUser.username, user.username);
                    assert.ok(appUserController.getUserView(dbUser), user);
                }
            };
            appUserController.getUser(req, res);
        });
    });

    describe('#validatePostUserForm', function () {
        it('valida el formulario de alta de usuario', function () {
            {
                let { type, username, password = 'Pass', firstName = 'Martin', lastName = 'Zaragoza', country, email, birthdate } = userMock1;
                assert.ok(appUserController.validatePostUserForm({ type, username, password, firstName, lastName, country, email, birthdate }).valid);
            }

            {
                let { type, username, password = undefined, firstName = 'Martin', lastName = 'Zaragoza', country, email, birthdate } = userMock1;
                assert.ok(!appUserController.validatePostUserForm({ type, username, password, firstName, lastName, country, email, birthdate }).valid);
            }

            {
                let { type, username, password = 'pass', firstName = 'Martin', lastName = 'Zaragoza', country, email, birthdate } = userMock1;
                email = 'mzaragoza@como@estas.com';
                assert.ok(!appUserController.validatePostUserForm({ type, username, password, firstName, lastName, country, email, birthdate }).valid);
            }

            {
                let { type, username, password = 'pass', firstName = 'Martin', lastName = 'Zaragoza', country, email, birthdate } = userMock1;
                birthdate = '1994-10-33';
                assert.ok(!appUserController.validatePostUserForm({ type, username, password, firstName, lastName, country, email, birthdate }).valid);
            }
        });
    });

    describe('#postUser', function () {
        it('Falla por no ingresar todos los campos necesarios', function () {
            const req = {};
            const res = mockErrRes(400);
            appUserController.postUser(req, res);
        });

        it('Falla por un error en la bbdd', function () {
            sandbox.stub(ApplicationUser, 'insert')
                .callsFake((user, callback) => callback(new Error()));

            let { type, username, password = 'Pass', firstName = 'Martin', lastName = 'Zaragoza', country, email, birthdate } = userMock1;
            const req = { body: { type, username, password, firstName, lastName, country, email, birthdate } };
            const res = mockErrRes(500);
            appUserController.postUser(req, res);
        });

        it('Inserta un usuario correctamente', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'insert')
                .callsFake((user, callback) => callback(null, dbUser));

            let { type, username, password = 'pass', firstName = dbUser.name, lastName = dbUser.surname, country, email, birthdate } = dbUser;
            const req = { body: { type, username, password, firstName, lastName, country, email, birthdate } };
            const res = {
                status(code) { this.code = code; },
                send({ metadata, user }) {
                    assert.ok(metadata.version);
                    assert.equal(201, this.code);
                    assert.ok(user);
                    assert.ok(appUserController.getUserView(dbUser), user);
                }
            };
            appUserController.postUser(req, res);
        });
    });

    describe('#deleteUser', function () {
        it('Falla por un error en la bbdd al buscar el usuario', function () {
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(new Error()));

            const req = { params: { userId: userMock1.id } };
            const res = mockErrRes(500);
            appUserController.deleteUser(req, res);
        });

        it('Falla por no encontrar el usuario', function () {
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, null));

            const req = { params: { userId: userMock1.id } };
            const res = mockErrRes(404);
            appUserController.deleteUser(req, res);
        });

        it('Elimina correctamente al usuario', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, dbUser));
            sandbox.stub(ApplicationUser, 'delete')
                .callsFake((user, callback) => callback(null, dbUser));

            const req = { params: { userId: dbUser.id } };
            const res = mockErrRes(204);
            appUserController.deleteUser(req, res);
        });

        it('Falla porque ocurre un error en la bbdd al eliminar', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, dbUser));
            sandbox.stub(ApplicationUser, 'delete')
                .callsFake((user, callback) => callback(new Error()));

            const req = { params: { userId: dbUser.id } };
            const res = mockErrRes(500);
            appUserController.deleteUser(req, res);
        });
    });

    describe('#validateUser', function () {
        it('Falla por falta de parametros', function () {
            {
                const [username, password, facebookAuthToken] = [userMock1.username];
                const req = { body: { username, password, facebookAuthToken } };
                const res = mockErrRes(400);
                appUserController.validateUser(req, res);
            }
            {
                const [username, password, facebookAuthToken] = [undefined, 'pass'];
                const req = { body: { username, password, facebookAuthToken } };
                const res = mockErrRes(400);
                appUserController.validateUser(req, res);
            }
        });

        it('Falla por un error en la bbdd', function () {
            const [username, facebookAuthToken] = [userMock1.username, '123456'];
            sandbox.stub(ApplicationUser, 'findByUsernameAndApp')
                .callsFake((username, serverId, callback) => callback(new Error()));

            const req = { body: { username, facebookAuthToken }, serverId: serverMock1.id };
            const res = mockErrRes(500);
            appUserController.validateUser(req, res);
        });

        it('Falla por un error en la bbdd', function () {
            const [username, password] = [userMock1.username, '123456'];
            sandbox.stub(ApplicationUser, 'findByUsernameAndApp')
                .callsFake((username, serverId, callback) => callback());

            const req = { body: { username, password }, serverId: serverMock1.id };
            const res = mockErrRes(404);
            appUserController.validateUser(req, res);
        });

        it('Falla la validacion del usuario', function () {
            const [username, password] = [userMock1.username, '123456'];
            const dbUser = ApplicationUser.fromObj(userMock1);
            dbUser.password = 'different password';
            sandbox.stub(ApplicationUser, 'findByUsernameAndApp')
                .callsFake((username, serverId, callback) => callback(null, dbUser));

            const req = { body: { username, password }, serverId: serverMock1.id };
            const res = mockErrRes(401);
            appUserController.validateUser(req, res);
        });

        it('Valida el usuario correctamente', function () {
            const [username, password] = [userMock1.username, '123456'];
            const dbUser = ApplicationUser.fromObj(userMock1);
            dbUser.password = password;
            sandbox.stub(ApplicationUser, 'findByUsernameAndApp')
                .callsFake((username, serverId, callback) => callback(null, dbUser));

            const req = { body: { username, password }, serverId: serverMock1.id };
            const res = {
                send({ metadata, user }) {
                    assert.ok(metadata.version);
                    let eq = JSON.stringify(appUserController.getUserView(dbUser)) == JSON.stringify(user);
                    assert.ok(eq);
                }
            };
            appUserController.validateUser(req, res);
        });
    });

    describe('#updateUser', function () {
        it('Falla dado que el usuario no existe', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback());

            const req = { params: { userId: dbUser.id } };
            const res = mockErrRes(404);
            appUserController.updateUser(req, res);
        });

        it('Falla dado por una colision', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, dbUser));

            let { _ref, type, username, password, fb, firstName = dbUser.name, lastName = dbUser.surname, country, email, birthdate, images } = dbUser;
            _ref = 'different ref';

            const req = {
                params: { userId: dbUser.id },
                body: { _ref, type, username, password, fb, firstName, lastName, country, email, birthdate, images }
            };
            const res = mockErrRes(409);
            appUserController.updateUser(req, res);
        });

        it('Actualiza correctamente al usuario', function () {
            const dbUser = ApplicationUser.fromObj(userMock1);
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, dbUser));

            let { _ref, type, username, password, fb, firstName, lastName, country, email, birthdate, images } = dbUser;
            firstName = 'Different name';
            lastName = 'Different last name';
            country = 'Brasil';
            images = [];

            dbUser.update = function (callback) {
                callback(null, dbUser);
            };

            const req = {
                params: { userId: dbUser.id },
                body: { _ref, type, username, password, fb, firstName, lastName, country, email, birthdate, images }
            };
            const res = {
                send({ metadata, user }) {
                    assert.ok(metadata.version);
                    assert.equal(JSON.stringify(appUserController.getUserView(dbUser)), JSON.stringify(user));
                }
            };
            appUserController.updateUser(req, res);
        });
    });

    describe('#getUserCars', function () {
        it('Obtiene los autos del usuario', function () {
            const dbUser = ApplicationUser.fromObj(userMock3);
            sandbox.stub(ApplicationUser, 'findByIdAndApp')
                .callsFake((userId, serverId, callback) => callback(null, dbUser));

            const req = { serverId: dbUser.applicationOwner, params: { userId: dbUser.id } };
            const res = {
                send({ metadata, cars }) {
                    assert.equal(dbUser.cars, cars);
                    assert.equal(dbUser.cars.length, metadata.total);
                }
            };

            appUserController.getUserCars(req, res);
        });
    });
});


