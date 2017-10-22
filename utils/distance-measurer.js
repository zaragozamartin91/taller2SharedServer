var a = 34.498254 - 34.603237;
var b = 58.534890 - 58.374683;

var c = Math.sqrt(a * a + b * b);

const KM_FACTOR = 18.75 / c;

/**
 * Obtiene una distancia en kilometros a partir de dos puntos medidos con latitud y longitud.
 * @param {number} lat1 Latitud de punto 1
 * @param {number} lon1 Longitud de punto 1
 * @param {number} lat2 Latitud de punto 2
 * @param {number} lon2 Longitud de punto 2
 */
function distanceKm(lat1, lon1, lat2, lon2) {
    const a = lat1 - lat2;
    const b = lon1 - lon2;
    return Math.sqrt(a * a + b * b) * KM_FACTOR;
}

exports.distanceKm = distanceKm;

/**
 * Obtiene una distancia en metros a partir de dos puntos medidos con latitud y longitud.
 * @param {number} lat1 Latitud de punto 1
 * @param {number} lon1 Longitud de punto 1
 * @param {number} lat2 Latitud de punto 2
 * @param {number} lon2 Longitud de punto 2
 */
exports.distanceMt = function (lat1, lon1, lat2, lon2) {
    return distanceKm(lat1, lon1, lat2, lon2) * 1000;
};