const assert = require('assert');
const dataValidator = require('../utils/data-validator');

describe('data-validator', function () {
    beforeEach(function () {
    });

    describe('#validateEmail()', function () {
        it('Valida una direccion de correo', function () {
            assert.ok(dataValidator.validateEmail('mzaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m.zaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m_zaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m_zaragoza.23@gmail.com'));
            assert.ok(!dataValidator.validateEmail(null));
        });
    });

    describe('#validateDate()',function(){
        it('Valida una fecha', function() {
            assert.ok(dataValidator.validateDate('1991-03-21'));
            assert.ok(dataValidator.validateDate('21-03-1991','DD-MM-YYYY'));
            assert.ok(!dataValidator.validateDate(''));
        });
    });

    afterEach(function () {
    });
});


