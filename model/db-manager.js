console.log('CONFIGURANDO DATABASE MANAGER');

const modelConfig = require('./model-config');
const { Pool } = require('pg');

function buildPool() {
    let pool = process.env.DATABASE_URL ?
        new Pool({ connectionString: connectionString, }) :
        new Pool({
            user: process.env.PGUSER || modelConfig.user,
            host: process.env.PGHOST || modelConfig.host,
            database: process.env.PGDATABASE || modelConfig.db,
            password: process.env.PGPASSWORD || modelConfig.password,
            port: process.env.PGPORT || modelConfig.port,
        });

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
 * @param {Array} values Valores a reemplazar en los placeholders.
 * @param {Function} callback Funcion a invocar al finalizar la query.
 */
exports.query = function (sql, values, callback) {
    poolWrapper.pool.connect().then(client => {
        return client.query(sql, values)
            .then(res => {
                client.release();
                callback(null, res);
            })
            .catch(err => {
                client.release();
                callback(err);
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