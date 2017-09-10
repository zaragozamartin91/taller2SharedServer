const assert = require('assert');
const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const sinon = require('sinon');
const stub = sinon.stub;

/* MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. */

describe('BusinessUser', function () {
    beforeEach(function () {
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
            stub(dbManager, 'query').callsFake((sql, values, cb) => {
                const res = { rows: [usrObj] };
                cb(null, res);
            });

            BusinessUser.insert(usrObj, (err, user) => {
                assert.equal(usrObj.username, user.username);
                done();
            });
        });
    });

    describe('#fromObj()', function () {
        it('Retorna null si el usuario es undefined', function () {
            assert.ok(BusinessUser.fromObj(undefined) == null);
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
    });
});