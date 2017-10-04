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
                }
            };
            appUserController.getUser(req, res);
        });
    });
});


