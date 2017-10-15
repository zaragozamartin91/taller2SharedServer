const BusinessUser = require('./BusinessUser');
//const Role = require('./Role');
const ApplicationServer = require('./ApplicationServer');
const ApplicationUser = require('./ApplicationUser');
const Car = require('./Car');
const TokenModel = require('./Token');
const Trip = require('./Trip');

const dbManager = require('./db-manager');
const logger = require('log4js').getLogger('table-manager');

// BusinessUser-----------------------------------------------------------------------------

/**
 * Crea la tabla de usuarios de negocio.
 * @param {Function} callback Funcion a invocar luego de crear la tabla.
 */
exports.createBusinessUserTable = function (callback) {
    const sql = `CREATE TABLE ${BusinessUser.table} (
        id ${BusinessUser.idType} PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(256) NOT NULL,
        name VARCHAR(32) DEFAULT '${BusinessUser.DEFAULT_NAME}',
        surname VARCHAR(32) DEFAULT '${BusinessUser.DEFAULT_SURNAME}',
        roles JSON DEFAULT '[]'
    )`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

exports.dropBusinessUserTable = function (callback) {
    dbManager.query(`DROP TABLE ${BusinessUser.table}`, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

// ApplicationServer ----------------------------------------------------------------------------------------

exports.createApplicationServerTable = function (callback) {
    dbManager.query(`CREATE TABLE ${ApplicationServer.table} (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        _ref VARCHAR(256) NOT NULL,
        created_by ${BusinessUser.idType} REFERENCES ${BusinessUser.table}(id) ON DELETE SET NULL,
        created_time TIMESTAMP DEFAULT now(),
        name VARCHAR(64) UNIQUE NOT NULL,
        last_conn TIMESTAMP DEFAULT now())`, [], callback);
};

exports.dropApplicationServerTable = function (callback) {
    dbManager.query(`DROP TABLE ${ApplicationServer.table}`, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

// TokenModel -------------------------------------------------------------------------------------------------

exports.createTokenTable = function (callback) {
    const sql = `CREATE TABLE ${TokenModel.table} (
        token VARCHAR(256) NOT NULL,
        expiresAt TIMESTAMP NOT NULL,
        owner VARCHAR(64) DEFAULT '',
        counter SERIAL
    )`;
    dbManager.query(sql, [], err => {
        if (err) console.error(err);
        callback(err);
    });
};

exports.dropTokenTable = function (callback) {
    const sql = `DROP TABLE ${TokenModel.table}`;
    dbManager.query(sql, [], err => {
        if (err) console.error(err);
        callback(err);
    });
};

// ApplicationUser -------------------------------------------------------------------------------------------------------

// EL BALANCE LO GUARDO COMO UN JSON
exports.createApplicationUserTable = function (callback) {
    const sql = `CREATE TABLE ${ApplicationUser.table} (
        id ${ApplicationUser.idType} PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        applicationOwner ${ApplicationServer.idType} REFERENCES ${ApplicationServer.table}(id) ON DELETE CASCADE, 
        username VARCHAR(64) NOT NULL,
        password VARCHAR(256) NOT NULL,
        name VARCHAR(32) DEFAULT '${ApplicationUser.DEFAULT_NAME}',
        surname VARCHAR(32) DEFAULT '${ApplicationUser.DEFAULT_SURNAME}',
        country VARCHAR(32),
        email VARCHAR(64),
        birthdate TIMESTAMP,
        type VARCHAR(16),
        images JSON DEFAULT '[]',
        balance JSON DEFAULT '[]',
        fb JSON DEFAULT '{}',
        UNIQUE (applicationOwner, username)
    )`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

exports.dropApplicationUserTable = function (callback) {
    const sql = `DROP TABLE ${ApplicationUser.table}`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

// Car -------------------------------------------------------------------------------------------------------

exports.createCarTable = function (callback) {
    const sql = `CREATE TABLE ${Car.table} (
        id SERIAL PRIMARY KEY,
        _ref VARCHAR(128) NOT NULL,
        owner ${ApplicationUser.idType} REFERENCES ${ApplicationUser.table}(id) ON DELETE CASCADE,
        properties JSON DEFAULT '[]'
    )`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

exports.dropCarTable = function (callback) {
    const sql = `DROP TABLE ${Car.table}`;
    dbManager.query(sql, [], err => {
        if (err) logger.error(err);
        callback();
    });
};

// Trip -------------------------------------------------------------------------------------------------------

/* NOTA: LOS NOMBRES DE COLUMNA start Y end SON INVALIDOS, POR LO CUAL SE ASIGNAN LOS NOMBRES DE COLUMNA
_start Y _end. */
exports.createTripTable = function (callback) {
    const sql = `CREATE TABLE ${Trip.TABLE} (
        id SERIAL PRIMARY KEY, 
        applicationOwner ${ApplicationServer.idType} REFERENCES ${ApplicationServer.table}(id) ON DELETE CASCADE , 
        driver ${ApplicationUser.idType} REFERENCES ${ApplicationUser.table}(id) ON DELETE CASCADE, 
        passenger ${ApplicationUser.idType} REFERENCES ${ApplicationUser.table}(id) ON DELETE CASCADE, 
        _start JSON DEFAULT '{}', 
        _end JSON DEFAULT '{}', 
        totalTime INTEGER DEFAULT 0, 
        waitTime INTEGER DEFAULT 0, 
        travelTime INTEGER DEFAULT 0, 
        distance INTEGER DEFAULT 0, 
        route JSON DEFAULT '[]', 
        cost JSON DEFAULT '{}'
    )`;
    dbManager.queryPromise(sql, [])
        .then(() => callback())
        .catch(cause => {
            logger.error(cause);
            callback();
        });
};

exports.dropTripTable = function (callback) {
    dbManager.queryPromise(`DROP TABLE ${Trip.TABLE}`, [])
        .then(() => callback())
        .catch(cause => {
            logger.error(cause);
            callback();
        });
};