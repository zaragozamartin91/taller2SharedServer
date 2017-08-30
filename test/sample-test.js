const assert = require('assert');

/* ESTE ES UN EJEMPLO DE COMO SE ESCRIBEN TESTS EN NODEJS USANDO MOCHA */

/* NO SE RECOMIENDA PASAR ARROW FUNCTIONS A MOCHA:
http://mochajs.org/#arrow-functions
 */

describe('Array', function () {
    beforeEach(function () {
        console.log('before each!');
    });

    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });

    describe('#asyncOp()', function () {
        /* EL PARAMETRO done ES UN CALLBACK QUE SE DEBE INVOCAR PARA MARCAR EL FIN DE LA EJECUCION */
        it('should do stuff async', function (done) {
            setTimeout(() => {
                console.log('doing stuff');
                /* SI OCURRE UN ERROR, DEBE LLAMARSE A done(err) */
                done();
            }, 1000);
        });
    });
});


