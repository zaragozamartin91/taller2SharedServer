const assert = require('assert');
const hasher = require('../utils/hasher');

describe('token-manager', function () {
    beforeEach(function () {
    });

    describe('#hash()', function () {
        it('obtiene un hash de un objeto', function () {
            const obj = { name: 'martin', surname: 'zaragoza' };
            const hash = hasher.hash(obj);
            assert.ok(hasher.verify(hash, obj));
        });
    });

    afterEach(function () {
    });
});


