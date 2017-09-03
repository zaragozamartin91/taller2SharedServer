const assert = require('assert');
const tokenManager = require('../utils/token-manager');

describe('token-manager', function () {
    beforeEach(function () {
    });

    /* El parametro "done" sirve para los tests de cosas asincronicas. */
    describe('#signToken()', function () {
        it('firmar un api token', function (done) {
            const username = 'martinzaragoza';
            const token = tokenManager.signToken({ username });
            
            tokenManager.verifyToken(token, (err, decoded) => {
                assert.ok(decoded.username.valueOf() == username);
                done();
            });
        });

        it('fallar al verificar un token invalido', function(done){            
            tokenManager.verifyToken('INVALID TOKEN VALUE', (err, decoded) => {
                if(err) done();
                else done(new Error('No deberia validar el token'));
            });

        });
    });

    afterEach(function(){
    });
});


