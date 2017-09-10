const assert = require('assert');
const idGenerator = require('../utils/id-generator');

describe('id-generator', function () {
    beforeEach(function () {
    });

    describe('#generateId()', function () {
        it('genera un id pseudoaleatorio a partir de un prefijo', function () {
            const prefix = 'some_prefix';
            const id = idGenerator.generateId(prefix);
            const split = id.split('-');

            assert.equal(2, split.length);
            assert.equal(prefix, split[0]);
            assert.ok(split[1]);
        });

        it('usa un prefijo por defecto si no se le asigna', function(){
            const id = idGenerator.generateId();
            const split = id.split('-');

            assert.equal(2, split.length);
            assert.equal(idGenerator.defaultPrefix, split[0]);
            assert.ok(split[1]);
        });
    });

    afterEach(function () {
    });
});


