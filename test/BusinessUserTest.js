const assert = require('assert');
const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const sinon = require('sinon');

let sandbox = null;

/* MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. */

const mockRow1 = {
    id: 'martin-27482',
    _ref: 'e291451c15bcef07757e85804dec9a197ed27588',
    username: 'martin',
    password: '$2a$10$yoedT7nE4nVw3./pu1mzIeDqNlwXi0hOGfeAEL.nthhcTE6E5q/1K',
    name: 'martin',
    surname: 'zaragoza',
    role: 'manager'
};
const mockRow2 = {
    id: 'martin-27482',
    _ref: 'e291451c15bcef07757e85804dec9a197ed27588',
    username: 'martin',
    password: '$2a$10$yoedT7nE4nVw3./pu1mzIeDqNlwXi0hOGfeAEL.nthhcTE6E5q/1K',
    name: 'martin',
    surname: 'zaragoza',
    role: 'admin'
};
const mockRow3 = {
    id: 'mateo-27482',
    _ref: 'e291451c15bcef07757e85804dec9a197ed27588',
    username: 'mateo',
    password: '$2a$10$yoedT7nE4nVw3./pu1mzIeDqNlwXi0hOGfeAEL.nthhcTE6E5q/1K',
    name: 'mateo',
    surname: 'zaragoza',
    role: 'user'
};

describe('BusinessUser', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#authenticate()', function () {
        it('autenticar al usuario si el password es correcto', function () {
            const user = BusinessUser.mockUsers[0];
            assert.ok(user.authenticate('pepe'));
            assert.ok(user.authenticate('INVALID PASSWORD') == false);
        });
    });

    describe('#insert()', function () {
        const usrObj = { username: 'martin', password: 'pepe' };
        it('inserta un usuario en la bbdd', function (done) {
            /* Genero un stub que reemplaza al metodo query de dbManager */
            sandbox.stub(dbManager, 'query').callsFake((sql, values, cb) => {
                const res = { rows: [usrObj] };
                cb(null, res);
            });

            BusinessUser.insert(usrObj, (err, user) => {
                assert.equal(usrObj.username, user.username);
                done();
            });
        });
    });

    describe('#findById()', function () {
        it('Obtiene un usuario a partir de su id', function (done) {
            sandbox.stub(dbManager, 'query').callsFake((sql, values, callback) => callback(null, { rows: [mockRow1, mockRow2] }));
            BusinessUser.findById(mockRow1.id, (err, user) => {
                assert.ok(!err);
                assert.equal(2, user.roles.length);
                done();
            });
        });
    });

    describe('#findByUsername()', function () {
        it('Obtiene un usuario a partir de su username', function (done) {
            sandbox.stub(dbManager, 'query').callsFake((sql, values, callback) => callback(null, { rows: [mockRow1, mockRow2] }));
            BusinessUser.findByUsername(mockRow1.username, (err, user) => {
                assert.ok(!err);
                assert.equal(2, user.roles.length);
                done();
            });
        });
    });

    describe('#hasRole()', function () {
        it('Determina si un usuario tiene un rol', function (done) {
            sandbox.stub(dbManager, 'query').callsFake((sql, values, callback) => callback(null, { rows: ['admin'] }));
            BusinessUser.hasRole(mockRow1, 'admin', (err, hasRole) => {
                assert.ok(hasRole);
                done();
            });
        });
    });

    describe('#find()', function () {
        it('Obtiene todos los usuarios', function (done) {
            sandbox.stub(dbManager, 'query').callsFake((sql, values, callback) => callback(null, { rows: [mockRow1, mockRow2, mockRow3] }));
            BusinessUser.find((err, users) => {
                assert.ok(!err);
                assert.equal(2, users[0].roles.length);
                assert.equal(2, users.length);
                done();
            });
        });
    });

    describe('#fromObj()', function () {
        it('Retorna null si el usuario es undefined', function () {
            assert.ok(BusinessUser.fromObj(undefined) == null);
            assert.ok(BusinessUser.fromObj(null) == null);
        });

        it('Retorna un business user a partir de un objeto con propiedades', function () {
            const userObj = { username: 'martin', password: 'pepe', name: 'martin', surname: 'zaragoza' };
            const user = BusinessUser.fromObj(userObj);
            assert.ok(user instanceof BusinessUser);
            assert.equal(userObj.username, user.username);
            assert.equal(userObj.password, user.password);
            assert.equal(userObj.name, user.name);
            assert.equal(userObj.surname, user.surname);
        });
    });

    describe('#buildUsersFromRows()', function () {
        it('crea un arreglo de usuarios de negocio a partir de filas de resultado de una query',
            function () {
                const rows = [
                    { id: 'martin-1234', username: 'martin', password: 'pepe', name: 'martin', surname: 'zaragoza', role: 'admin' },
                    { id: 'martin-1234', username: 'martin', password: 'pepe', name: 'martin', surname: 'zaragoza', role: 'manager' },
                    { id: 'mateo-5678', username: 'mateo', password: 'posting', name: 'mateo', surname: 'zaragoza' }
                ];

                const users = BusinessUser.buildUsersFromRows(rows);
                assert.equal(2, users.length);
                assert.equal(2, users[0].roles.length);
                assert.equal(0, users[1].roles.length);
            });

        it('Retorna un arreglo vacio de usuarios de negocio si no hay filas', function () {
            assert.ok(BusinessUser.buildUsersFromRows(null).length == 0);
            assert.ok(BusinessUser.buildUsersFromRows(undefined).length == 0);
            assert.ok(BusinessUser.buildUsersFromRows([]).length == 0);
        });
    });
});