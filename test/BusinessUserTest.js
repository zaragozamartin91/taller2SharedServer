const assert = require('assert');
const BusinessUser = require('../model/BusinessUser');

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
});