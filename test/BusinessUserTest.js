// ESTE TEST NO VA MAS. EL MODELO NO SERA TESTEADO DADO QUE SOLO IMPLICA TESTAR QUERIES DE POSTGRES

/*


const assert = require('assert');
const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const sinon = require('sinon');
const Role = require('../model/Role');

let sandbox = null;

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. 

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
            // Genero un stub que reemplaza al metodo query de dbManager 
            sandbox.stub(dbManager, 'queryPromise').callsFake((sql, values) => {
                return new Promise( resolve => resolve([usrObj]) );
            });

            BusinessUser.insert(usrObj, (err, user) => {
                if(err) {
                    console.error(err);
                    done(err);
                }
                assert.equal(usrObj.username, user.username);
                done();
            });
        });
    });

    
    describe('#fromObj()', function () {
        it('Crea un usuario a partir de un objeto', function () {
            const user = BusinessUser.fromObj({
                id: 'martin-27482',
                _ref: 'e291451c15bcef07757e85804dec9a197ed27588',
                username: 'martin',
                password: '$2a$10$yoedT7nE4nVw3./pu1mzIeDqNlwXi0hOGfeAEL.nthhcTE6E5q/1K',
                name: 'martin',
                surname: 'zaragoza',
                roles: ['manager', 'user']
            });
            assert.ok(user.roles.length > 0);
        });
    });
});


*/