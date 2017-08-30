var MyList = require('../utils/MyList');
var assert = require('assert');

describe('MyList', function () {
    beforeEach(function () {
        console.log('before each!');
    });

    describe('#add(item)', function () {
        it('should add an item', function () {
            var list = new MyList();
            list.add(28);
            assert.equal(28, list.items[0]);
        });
    });
});