const assert = require('assert');
const sinon = require('sinon');

const distanceMeasurer = require('../utils/distance-measurer');

let a = 34.498254 - 34.603237;
let b = 58.534890 - 58.374683;
let c = Math.sqrt(a * a + b * b);
const KM_FACTOR = 18.75 / c;

describe('distance-measurer', function () {
    describe('#distanceMt', function () {
        it('Mide distancia en metros a partir de lat y long', function () {
            const [lat1, lon1, lat2, lon2] = [1, 2, 3, 4];
            const a = lat1 - lat2;
            const b = lon1 - lon2;
            const res = Math.sqrt(a * a + b * b) * KM_FACTOR * 1000;
            assert.equal(res, distanceMeasurer.distanceMt(lat1, lon1, lat2, lon2));
        });
    });
});