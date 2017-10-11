const assert = require('assert');
const tokenController = require('../controllers/token-controller');

const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const sinon = require('sinon');
const Role = require('../model/Role');

let sandbox = null;

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. 

const usrObjMock1 = {
    id: 'martin-27482',
    _ref: 'e291451c15bcef07757e85804dec9a197ed27588',
    username: 'mzaragoza',
    password: '$2a$10$yoedT7nE4nVw3./pu1mzIeDqNlwXi0hOGfeAEL.nthhcTE6E5q/1K',
    name: 'Martin',
    surname: 'Zaragoza',
    roles: ['manager']
};

const usrObjMock2 = {
    'id': 'mateo-69396',
    '_ref': '3072ca4332018c694479907e24ef2a7086d76063',
    'username': 'mateo',
    'password': '$2a$10$oQqac7Ii.AYVaF6NQfkH.eXOP8Gy5mb4YT0wBsdgFdHy6A1pEPh2W',
    'name': 'mateo',
    'surname': 'zaragoza',
    'roles': [
        'user',
        'admin'
    ]
};

const authHeaderMock = 'Basic bWFydGluOnBlcGU=';

function mockErrRes(expectedCode) {
    return {
        status(code) { this.code = code; },
        send({ code, message }) {
            assert.ok(message);
            assert.equal(expectedCode, code);
        }
    };
}

describe('token-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#generateToken()', function () {
        it('Falla debido a que el request esta incompleto', function () {
            const req = { body: {}, headers: {} };
            const res = mockErrRes(400);
            tokenController.generateToken(req, res);
        });

        it('Falla debido a que el usuario no existe', function () {
            const req = { body: { username: 'martin', password: 'pepe' }, headers: {} };
            const res = mockErrRes(400);

            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback());

            tokenController.generateToken(req, res);
        });

        it('Falla debido a un error en la bbdd', function () {
            const req = { body: { username: 'martin', password: 'pepe' }, headers: {} };
            const res = mockErrRes(500);

            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback(new Error()));

            tokenController.generateToken(req, res);
        });

        it('Genera el token para el usuario', function () {
            const dbUser = BusinessUser.fromObj(usrObjMock1);
            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback(null, dbUser));

            const req = { body: { username: 'martin', password: 'pepe' }, headers: {} };
            const res = {
                send({ metadata: { version }, token: { token, expiresAt } }) {
                    assert.ok(version);
                    assert.ok(token);
                    assert.ok(expiresAt);
                }
            };
            tokenController.generateToken(req, res);
        });

        it('Genera el token para el usuario usando el basic auth header', function () {
            const dbUser = BusinessUser.fromObj(usrObjMock1);
            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback(null, dbUser));

            const req = { body: {}, headers: { authorization: authHeaderMock } };
            const res = {
                send({ metadata: { version }, token: { token, expiresAt } }) {
                    assert.ok(version);
                    assert.ok(token);
                    assert.ok(expiresAt);
                }
            };
            tokenController.generateToken(req, res);
        });

        it('Falla porque el password es invalido', function () {
            const dbUser = BusinessUser.fromObj(usrObjMock1);
            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback(null, dbUser));

            const req = { body: { username: 'martin', password: 'INVALID PASSWORD' }, headers: {} };
            const res = mockErrRes(401);
            tokenController.generateToken(req, res);
        });

        it('Genera el token para el usuario usando backoffice', function () {
            const dbUser = BusinessUser.fromObj(usrObjMock1);
            sandbox.stub(BusinessUser, 'findByUsername')
                .callsFake((username, callback) => callback(null, dbUser));

            const req = { body: { username: 'martin', password: 'pepe', backoffice: true }, headers: {} };
            const res = {
                send({ metadata: { version }, token: { token, expiresAt } }) {
                    assert.ok(version);
                    assert.ok(token);
                    assert.ok(expiresAt);
                },
                cookie(name, token, { expires }) {
                    assert.ok(name);
                    assert.ok(token);
                    assert.ok(expires);
                }
            };
            tokenController.generateToken(req, res);
        });
    });
});

