const assert = require('assert');
const sinon = require('sinon');
const hitsController = require('../controllers/hits-controller');
const Hit = require('../model/Hit');

let sandbox = null;

function mockErrRes(expectedCode) {
    return {
        status(code) { this.code = code; },
        send({ code, message }) {
            assert.ok(message);
            assert.equal(expectedCode, code);
        }
    };
}

const hitsMock = [
    { "count": "4", "hour": 2 },
    { "count": "2", "hour": 3 },
    { "count": "6", "hour": 5 },
];

describe('hits-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#countLastDayByHour', function () {
        it('Falla por un error en la BBDD', function () {
            sandbox.stub(Hit, 'countLastDayByHour')
                .callsFake((serverId, callback) => callback(new Error('error')));

            const req = { params: { serverId: 'llevame' } };
            const res = mockErrRes(500);
            hitsController.countLastDayByHour(req, res);
        });

        it('Obtiene los hits exitosamente', function () {
            sandbox.stub(Hit, 'countLastDayByHour')
                .callsFake((serverId, callback) => callback(null, hitsMock));

            const req = { params: { serverId: 'llevame' } };
            const res = {
                send(hits) {
                    assert.equal(hitsMock, hits);
                }
            };
            hitsController.countLastDayByHour(req, res);
        });
    });
});