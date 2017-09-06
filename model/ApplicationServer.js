/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const logger = require('log4js').getLogger('ApplicationServer');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'application_server';

/* CODIGO -------------------------------------------------------------------------------------- */

function hashServer(id, name) {
    return hasher.hash({ id, name });
}

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

/**
 * Crea una instancia de app server a partir de una fila de postgres.
 * 
 * @param {object} obj Propiedades / campos de la fila resultado de una query.
 * @return {ApplicationServer} Nueva instancia de app server.
 */
ApplicationServer.fromRow = function (obj) {
    if (obj) {
        const appServer = new ApplicationServer(
            obj.id,
            obj._ref,
            obj.createdBy || obj.created_by,
            new Date(obj.createdTime || obj.created_time),
            obj.name,
            new Date(obj.lastConn || obj.last_conn)
        );
        return appServer;
    } else return null;
};

/* TODO : created_by TIENE QUE SER UNA REFERENCIA A UN BusinessUser?
created_time / last_conn, TIENEN QUE SER DE TIPO Date EN POSTGRES? */

ApplicationServer.insert = function (obj, callback) {
    const name = obj.name;
    const id = idGenerator.generateId(name);
    const _ref = hashServer(id, name);
    const createdBy = obj.createdBy || obj.created_by;
    const createdTime = new Date();

    dbManager.query(`INSERT INTO ${table} 
        (id,_ref,created_by,name,created_time)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, _ref, createdBy, name, createdTime], (err, res) => {
            if (err) return callback(err);
            return callback(null, ApplicationServer.fromRow(res.rows[0]));
        });
};

ApplicationServer.find = function (callback) {
    dbManager.query(`SELECT * FROM ${table}`, [], (err, res) => {
        if (err) return callback(err);
        callback(null, res.rows.map(ApplicationServer.fromRow));
    });
};

ApplicationServer.findById = function (serverId, callback) {
    console.log('BUSCANDO SERVER CON ID: ' + serverId);
    dbManager.query(`SELECT * FROM ${table} WHERE id=$1`, [serverId], (err, res) => {
        if (err) return callback(err);
        const rows = res.rows;
        if (rows.length) return callback(null, ApplicationServer.fromRow(rows[0]));
        return callback(null, null);
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

ApplicationServer.prototype.delete = function (callback) {
    dbManager.query(`DELETE FROM ${table} WHERE id=$1`, [this.id], callback);
};

// TODO : INVESTIGAR QUE ES LO QUE HAY QUE HACER CON EL PARAMETRO _ref
ApplicationServer.prototype.update = function (callback) {
    const id = this.id;
    const name = this.name || '';
    const _ref = this._ref;
    const newRef = hashServer(id, name);

    dbManager.query(`UPDATE ${table} SET name=$1,_ref=$2 WHERE id=$3 AND _ref=$4 RETURNING *`,
        [name, newRef, id, _ref], (err, res) => {
            if (err) return callback(err);
            const rows = res.rows;
            if (rows.length) return callback(null, ApplicationServer.fromRow(rows[0]));
            
            logger.debug(`El server ${id} NO FUE actualizado`);
            callback(null, null);
        });
};

ApplicationServer.withTimestampFields = function (server) {
    return server.withTimestampFields();
};

ApplicationServer.prototype.withTimestampFields = function () {
    this.lastConnection = this.lastConnection.getTime();
    this.createdTime = this.createdTime.getTime();
    return this;
};

module.exports = ApplicationServer;