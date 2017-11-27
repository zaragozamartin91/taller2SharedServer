const assert = require('assert');
const encryptor = require('../utils/encryptor');

describe('encryptor', function () {
    beforeEach(function () {
    });

    describe('#encrypt()', function () {
        it('Encripta una clave', function () {
            const password = 'my password';
            const encrypted = encryptor.encrypt(password);
            assert.ok(encryptor.verify(encrypted, password));
            assert.ok(!encryptor.verify(encrypted, 'DIFFERENT PASSWORD'));
        });
    });

    afterEach(function () {
    });
});


