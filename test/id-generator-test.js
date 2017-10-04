const assert = require('assert');
const idGenerator = require('../utils/id-generator');

describe('id-generator', function () {
    beforeEach(function () {
    });

    describe('#generateId()', function () {
        it('genera un id pseudoaleatorio a partir de un prefijo', function () {
            const prefix = 'Some Prefix';
            const id = idGenerator.generateId(prefix);

            assert.equal('someprefix', id);
        });
    });

    afterEach(function () {
    });
});


