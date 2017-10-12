const assert = require('assert');
const idGenerator = require('../utils/id-generator');

describe('id-generator', function () {
    beforeEach(function () {
    });

    describe('#generateId()', function () {
        it('genera un id estandarizado', function () {
            const prefix = 'Some Prefix';
            const id = idGenerator.generateId(prefix);

            assert.equal('someprefix', id);
        });
    });

    describe('#generateApplicationUserId()', function () {
        it('genera un id para usuarios de aplicacion', function () {
            const applicationOwner = 'llevame';
            const username = 'M Zaragoza';
            assert.equal('llevame-mzaragoza', idGenerator.generateApplicationUserId(applicationOwner, username));
        });
    });

    afterEach(function () {
    });
});


