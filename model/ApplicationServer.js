/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');
const logger = require('log4js').getLogger('ApplicationServer');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'application_server';
const idType = 'VARCHAR(64)';

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

ApplicationServer.table = table;
ApplicationServer.idType = idType;

/**
 * Crea una instancia de app server a partir de una fila de postgres.
 * 
 * @param {object} obj Propiedades / campos de la fila resultado de una query.
 * @return {ApplicationServer} Nueva instancia de app server.
 */
ApplicationServer.fromObj = function (obj) {
    if (obj) {
        const appServer = new ApplicationServer(
            obj.id,
            obj._ref,
            obj.createdBy || obj.created_by,
            new Date(obj.createdTime || obj.created_time),
            obj.name,
            new Date(obj.lastConn || obj.last_conn || obj.lastConnection)
        );
        return appServer;
    } else return null;
};

function fromRows(rows = []) {
    return rows.map(ApplicationServer.fromObj);
}

function buildServer({ name, createdBy, created_by }) {
    const id = idGenerator.generateId(name);
    const _ref = hashServer(id, name);
    const createdTime = new Date();
    return new ApplicationServer(id, _ref, created_by || createdBy, createdTime, name, createdTime);
}

ApplicationServer.buildServer = buildServer;

/* istanbul ignore next */
ApplicationServer.insert = function (obj, callback) {
    const server = buildServer(obj);
    const { id, _ref, createdBy, createdTime, name } = server;

    dbManager.query(`INSERT INTO ${table} 
        (id,_ref,created_by,name,created_time)
        VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [id, _ref, createdBy, name, createdTime], (err, res) => {
            if (err) return callback(err);
            return callback(null, ApplicationServer.fromObj(res.rows[0]));
        });
};

/* istanbul ignore next */
ApplicationServer.find = function (callback) {
    dbManager.query(`SELECT * FROM ${table}`, [], (err, res) => {
        if (err) return callback(err);
        callback(null, fromRows(res.rows));
    });
};

/* istanbul ignore next */
ApplicationServer.findById = function (serverId, callback) {
    console.log('BUSCANDO SERVER CON ID: ' + serverId);
    dbManager.query(`SELECT * FROM ${table} WHERE id=$1`, [serverId], (err, res) => {
        if (err) return callback(err);
        const rows = res.rows;
        if (rows.length) return callback(null, ApplicationServer.fromObj(rows[0]));
        return callback(null, null);
    });
};

/* istanbul ignore next */
ApplicationServer.delete = function (server, callback) {
    const id = server.id || server;
    const sql = `DELETE FROM ${table} WHERE id=$1 RETURNING *`;
    dbManager.query(sql, [id], (err, res) => {
        if (err) return callback(err);
        callback(null, ApplicationServer.fromObj(res.rows[0]));
    });
};

/* istanbul ignore next */
ApplicationServer.update = function (server, callback) {
    const { id, createdBy, createdTime, name = '', lastConnection } = server;
    const newRef = hashServer(id, name);

    const sql = `UPDATE ${table} SET name=$1,_ref=$2 WHERE id=$3 RETURNING *`;

    dbManager.queryPromise(sql, [name, newRef, id])
        .then(rows => callback(null, new ApplicationServer(id, newRef, createdBy, createdTime, name, lastConnection)))
        .catch(err => callback(err));
};

/* istanbul ignore next */
ApplicationServer.updateLastConnection = function (server, callback) {
    const id = server.id || server;
    const sql = `UPDATE ${table} SET last_conn=now() WHERE id=$1 RETURNING *`;
    dbManager.queryPromise(sql, [id])
        .then(rows => callback(null, fromRows(rows)[0]))
        .catch(err => callback(err));
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