const defaultPrefix = 'ID';

/**
 * Genera un id pseudoaleatorio (ej: martin-12343).
 * @param {string} prefix Prefijo del id.
 * @return {string} Id generado.
 */
function generateId(prefix) {
    prefix = prefix || defaultPrefix;
    prefix = prefix.replace(/ +/g, '');
    return `${prefix}-${Math.floor(Math.random() * 100000).toString()}`;
}

exports.generateId = generateId;
exports.defaultPrefix = defaultPrefix;