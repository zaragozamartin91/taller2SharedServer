const assert = require('assert');
const serverController = require('../controllers/server-controller');
/* istanbul ignore next */
const dbManager = require('../model/db-manager');
const ApplicationServer = require('../model/ApplicationServer');
const sinon = require('sinon');

let sandbox = null;

// MOCHA recomienda fuertemente no usar lambdas "()=>{}" en la descripcion de los tests. 


describe('business-user-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getServer()', function () {
        it('Obtiene un server a partir de su id', function (done) {
            sandbox.stub(ApplicationServer, 'findById')
                .callsFake((server, callback) => callback());
        });

        done();
    });
});

