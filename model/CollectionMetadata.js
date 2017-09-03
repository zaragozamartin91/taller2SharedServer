/**
 * Crea una instancia de metadata de una coleccion.
 * @constructor
 * @this {CollectionMetadata}
 * @param {number} count Cantidad de elementos en la respuesta.
 * @param {number} total Cantidad de elementos existentes.
 * @param {string} next Link a la siguiente página.
 * @param {string} prev Link a la anterior página.
 * @param {string} first Link a la primera página.
 * @param {string} last Link a la última página.
 * @param {string} version Versión de la api.
 */
function CollectionMetadata(count, total, next, prev, first, last, version) {
    this.count = count;
    this.total = total;
    this.next = next;
    this.prev = prev;
    this.first = first;
    this.last = last;
    this.version = version;
}

module.exports = CollectionMetadata;