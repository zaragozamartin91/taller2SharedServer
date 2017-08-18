const mongoose = require('mongoose');

/* While mpromise is sufficient for basic use cases, advanced users may want to plug in their favorite ES6-style promises library like bluebird, 
or just use native ES6 promises. Just set mongoose.Promise to your favorite ES6-style promise constructor and mongoose will use it. */
mongoose.Promise = global.Promise;


/**
 * Configura los schemas de mongo.
 * @param {boolean} regSchemas True si se deben registrar todos los schemas antes de invocar al callback, false en caso contrario.
 * @param {function} callback (db) => void : Recibe una conexion con la BBDD inicializada.
 */
function config(regSchemas, callback) {
    /* FORMATO DE LA URL:
    mongoose.connect('mongodb://username:password@host:port/database?options...'); */
    let promise = mongoose.connect('mongodb://root:root@localhost/test', {
        useMongoClient: true,
        poolSize: 5
    });
    promise.then(db => {
        if (regSchemas) registerSchemas(db);
        callback(db);
    });
}

/**
 * Registra los shcemas disponibles.
 * 
 * @param  {Connection} db Conexion con mongo.
 */
function registerSchemas(db) {
    console.log("REGISTRANDO SCHEMAS");
    require('./User').registerSchema(db);
    require('./Band').registerSchema(db);
    require('./Song').registerSchema(db);
    require('./Advertisement').registerSchema(db);
    require('./Location').registerSchema(db);
    require('./Contract').registerSchema(db);
    require('./Event').registerSchema(db);
}

exports.config = config;
