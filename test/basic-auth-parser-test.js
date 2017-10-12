const assert = require('assert');
const basicAuthParser = require('../utils/basic-auth-parser');

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. 

const authHeaderMock = 'Basic bWFydGluOnBlcGU=';


describe('basic-auth-parser', function () {
    beforeEach(function () {
    });

    afterEach(function () {
    });

    describe('#parse()', function () {
        it('Parsea correctamente un header de tipo basic auth', function () {
            const req = { headers: { authorization: authHeaderMock } };
            const auth = basicAuthParser.parse(req);
            assert.equal('martin', auth.user);
            assert.equal('pepe', auth.pass);
        });

        it('Retorna objeto vacio si el encabezado de autenticacion esta vacio', function () {
            const req = { headers: {} };
            const auth = basicAuthParser.parse(req);
            assert.ok(Object.keys(auth).length == 0);
        });
    });
});

