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

            token.verify((err, decoded) => {
                assert.ok(decoded.username.valueOf() == username);
                done();
            });
        });

        it('fallar al verificar un token invalido', function (done) {
            tokenManager.verifyToken('INVALID TOKEN VALUE', (err, decoded) => {
                if (err) done();
                else done(new Error('No deberia validar el token'));
            });

        });
    });

    describe('#withDateExpiration()', function () {
        it('Convertir la expiracion en Date', function () {
            const username = 'martinzaragoza';
            let token = tokenManager.signToken({ username });
            const timestamp = token.expiresAt;

            // no debe explotar al llamarlo dos veces.
            token = token.withDateExpiration().withDateExpiration();

            assert.ok(token.expiresAt.getTime);
            assert.equal(timestamp, token.expiresAt.getTime());
        });
    });

    describe('#withTimestampExpiration()', function () {
        it('Convertir la expiracion en milisegundos', function () {
            const username = 'martinzaragoza';
            let token = tokenManager.signToken({ username });
            const timestamp = token.expiresAt;

            // la vuelta a timestamp desde Date ser posible. No debe explotar si se lo invoca dos veces seguidas
            token = token.withDateExpiration().withTimestampExpiration().withTimestampExpiration();

            assert.equal(timestamp, token.expiresAt);
        });
    });

    afterEach(function () {
    });
});


