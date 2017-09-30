const assert = require('assert');
const businessUserController = require('../controllers/business-user-controller');
/* istanbul ignore next */
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

describe('business-user-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#postUser()', function () {
        it('dar de alta un usuario correctamente', function (done) {
            sandbox.stub(BusinessUser, 'insert').callsFake((usrObj, callback) => {
                const user = BusinessUser.fromObj(usrObj);
                user._ref = BusinessUser.hashUser(user);
                callback(null, user);
            });

            const req = { body: usrObjMock1 };
            const res = {
                send: ({ metadata, businessUser }) => {
                    assert.ok(metadata);
                    assert.ok(businessUser);
                    done();
                }
            };
            businessUserController.postUser(req, res);
        });

        it('falla dar de alta por parametros faltantes', function (done) {
            const { username, password } = usrObjMock1;
            const req = { body: { username, password } };
            const res = {
                status(code) { this.code = code; },
                send({ code, message }) {
                    assert.equal(400, code);
                    assert.ok(message);
                    done();
                }
            };
            businessUserController.postUser(req, res);
        });

        it('falla dar de alta por error en la bbdd', function (done) {
            sandbox.stub(BusinessUser, 'insert').callsFake((usrObj, callback) => {
                callback(new Error('Falla al introducir el usuario'));
            });

            const req = { body: usrObjMock1 };
            const res = {
                status(code) { this.code = code; },
                send({ code, message }) {
                    assert.equal(500, code);
                    assert.ok(message);
                    done();
                }
            };
            businessUserController.postUser(req, res);
        });
    });

    describe('#updateUser()', function () {
        it('actualiza un  usuario correctamente', function (done) {
            sandbox.stub(BusinessUser, 'findById').callsFake((userId, callback) => {
                // uso fromRows para mejorar el coverage
                callback(null, BusinessUser.fromRows([usrObjMock1])[0]);
            });

            sandbox.stub(BusinessUser, 'update').callsFake((usrObj, callback) => {
                const user = BusinessUser.fromObj(usrObj);
                user._ref = BusinessUser.hashUser(user);
                callback(null, user);
            });

            const body = BusinessUser.fromObj(usrObjMock1);
            body.name = 'PEPE';
            body.roles = ['admin'];
            body.surname = 'ROBERTO';
            body.password = 'Different password';
            const req = { body, params: { userId: usrObjMock1.id } };
            const res = {
                send: ({ metadata, businessUser }) => {
                    assert.equal(body.name, businessUser.name);
                    assert.equal(body.surname, businessUser.surname);
                    assert.equal(1, businessUser.roles.length);
                    assert.equal('admin', businessUser.roles[0]);
                    assert.ok(metadata);
                    assert.ok(businessUser);
                    done();
                }
            };
            businessUserController.updateUser(req, res);
        });

        it('falla la actualizacion por un error en la bbdd al buscar el usuario', function (done) {
            sandbox.stub(BusinessUser, 'findById').callsFake((userId, callback) => {
                callback(new Error('Error al obtener el usuario'));
            });

            const req = { body: usrObjMock1, params: { userId: usrObjMock1.id } };
            const res = {
                status(code) { this.code = code; },
                send({ code, message }) {
                    assert.ok(500, code);
                    assert.ok(message);
                    assert.equal(code, this.code);
                    done();
                }
            };
            businessUserController.updateUser(req, res);
        });

        it('falla la actualizacion dado que el usuario no existe', function (done) {
            sandbox.stub(BusinessUser, 'findById').callsFake((userId, callback) => {
                callback();
            });

            const req = { body: usrObjMock1, params: { userId: usrObjMock1.id } };
            const res = {
                status(code) { this.code = code; },
                send({ code, message }) {
                    assert.ok(404, code);
                    assert.ok(message);
                    assert.equal(code, this.code);
                    done();
                }
            };
            businessUserController.updateUser(req, res);
        });

        it('falla por una colision', function (done) {
            sandbox.stub(BusinessUser, 'findById').callsFake((userId, callback) => {
                // uso fromRows para mejorar el coverage
                callback(null, BusinessUser.fromRows([usrObjMock1])[0]);
            });

            const { id, username, password, name, surname, roles } = usrObjMock1;
            const _ref = 'DIFFERENT REF';
            const body = { id, username, password, name, surname, roles, _ref };
            const req = { body, params: { userId: usrObjMock1.id } };
            const res = {
                status(code) { this.code = code; },
                send({ code, message }) {
                    assert.ok(409, code);
                    assert.ok(message);
                    assert.equal(code, this.code);
                    done();
                }
            };
            businessUserController.updateUser(req, res);
        });
    });


    describe('#getUsers', function () {
        it('obtiene los usuarios disponibles', function (done) {
            sandbox.stub(BusinessUser, 'find').callsFake(callback => {
                const users = [usrObjMock1, usrObjMock2];
                callback(null, BusinessUser.fromRows(users));
            });

            const req = {};
            const res = {
                send: ({ metadata, businessUser }) => {
                    assert.ok(metadata);
                    assert.ok(businessUser);
                    done();
                }
            };
            businessUserController.getUsers(req, res);
        });
    });
});

