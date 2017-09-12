console.log('CONFIGURANDO DATABASE MANAGER');

const modelConfig = require('./model-config');
const { Pool } = require('pg');
const EMPTY_RES = { isEmpty: true, rows: [] };

function buildPool() {
    console.log('CONSTRUYENDO POOL DE CONEXIONES DE BBDD');

    let pool = null;
    if (process.env.DATABASE_URL) {
        console.log(`CONFIGURANDO POOL CON URL ${process.env.DATABASE_URL}`);
        pool = new Pool({ connectionString: process.env.DATABASE_URL });
    } else {
        const host = process.env.PGHOST || modelConfig.host;
        console.log(`CONFIGURANDO POOL CON HOST ${host}`);
        pool = new Pool({
            user: process.env.PGUSER || modelConfig.user,
            host: host,
            database: process.env.PGDATABASE || modelConfig.db,
            password: process.env.PGPASSWORD || modelConfig.password,
            port: process.env.PGPORT || modelConfig.port,
        });
    }

    // the pool with emit an error on behalf of any idle clients
    // it contains if a backend error or network partition happens
    pool.on('error', (err, client) => {
        console.error('ERROR AL INICIAR SESION CON POSTGRES', err);
        process.exit(-1);
    });

    return pool;
}

const poolWrapper = {
    pool: buildPool()
};

/**
 * Realiza una query en la BBDD.
 * @param {string} sql Query en sql usando placeholders (ej: SELECT FROM USER WHERE ID=$1).
 * @param {Array} values [OPCIONAL] Valores a reemplazar en los placeholders.
 * @param {Function} callback Funcion a invocar al finalizar la query.
 */
exports.query = function (sql, values, callback) {
    if (!values || typeof values == 'function') {
        throw new Error('No se indicaron valores de query (pasar [] en caso de no requerir asignar valores)');
    }

    poolWrapper.pool.connect((err, client, done) => {
        if (err) return callback(err);

        client.query(sql, values || [], (err, res) => {
            done(); // done libera un cliente del pool
            res = res || EMPTY_RES;
            res.rows = res.rows || [];
            callback(err, res);
        });
    });
};

exports.end = function () {
    poolWrapper.pool.end();
};

exports.reset = function () {
    try {
        poolWrapper.pool.end();
    } finally {
        poolWrapper.pool = buildPool();
    }
};