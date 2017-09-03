/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'application_server';

/* CODIGO -------------------------------------------------------------------------------------- */

/**
 * Crea una instancia de app server.
 * 
 * @constructor
 * @this {ApplicationServer}
 * @param {string} id Id del server.
 * @param {string} _ref Hash que es utilizado para prevenir colosiones.
 * @param {string} createdBy Id del usuario de negocio que dio de alta el server.
 * @param {Date} createdTime Momento de creacion del server.
 * @param {string} name Nombre del server.
 * @param {Date} lastConnection Momento de ultima conexion con el server.
 */
function ApplicationServer(id, _ref, createdBy, createdTime, name, lastConnection) {
    this.id = id; 
    this._ref = _ref; 
    this.createdBy = createdBy; 
    this.createdTime = createdTime; 
    this.name = name; 
    this.lastConnection = lastConnection; 
}

ApplicationServer.fromRow = function (obj) {
    if (obj) {
        const appServer = new ApplicationServer(
            obj.id,
            obj._ref,
            obj.created_by,
            new Date(obj.created_time),
            obj.name,
            new Date(obj.last_conn)
        );
        return appServer;
    } else return null;
};

/* TODO : created_by TIENE QUE SER UNA REFERENCIA A UN BusinessUser?
created_time / last_conn, TIENEN QUE SER DE TIPO Date EN POSTGRES? */

ApplicationServer.insert = function (obj, callback) {
    const name = obj.name;
    const id = idGenerator.generateId(name);
    const _ref = hasher.hash({ id, name });
    const createdBy = obj.createdBy;
    const createdTime = new Date();

    dbManager.query(`INSERT INTO ${table} (id,_ref,created_by,name,created_time)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, _ref, createdBy, name, createdTime], callback);
};

ApplicationServer.find = function (callback) {
    dbManager.query(`SELECT * FROM ${table}`, [], (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows.map(ApplicationServer.fromRow));
    });
};

ApplicationServer.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        _ref VARCHAR(256) NOT NULL,
        created_by ${BusinessUser.idType} REFERENCES ${BusinessUser.table}(id),
        created_time TIMESTAMP DEFAULT now(),
        name VARCHAR(64) UNIQUE NOT NULL,
        last_conn TIMESTAMP DEFAULT now())`, [], callback);
};

module.exports = ApplicationServer;