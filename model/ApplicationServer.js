/* IMPORTS -------------------------------------------------------------------------------------- */

const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const hasher = require('../utils/hasher');
const idGenerator = require('../utils/id-generator');

/* CONSTANTES -------------------------------------------------------------------------------------- */

const table = 'application_server';

/* CODIGO -------------------------------------------------------------------------------------- */

function ApplicationServer() {
    this.id = ''; /* Idstring. 
    Se guarda como un string, pero podría ser un número
    es dependiente de la implementación. */

    this._ref = ''; /* Refstring.    
    Hash que es utilizado para prevenir colosiones.
    Cuando se crea un elemento, se debe pasar un valor de undefined (o no debe estar).
    Al actualizar, el servidor chequeará que este valor sea igual al guardado, de no coincidir,
    significa que otro actualizó el recurso, por ende, la actualización debe fallar. */

    this.createdBy = ''; /*Idstring.    
    Se guarda como un string, pero podría ser un número
    es dependiente de la implementación. */

    this.createdTime = 0; /* Timestampnumber. Tiempo en epoch*/

    this.name = ''; /*	string. Nombre del application server */

    this.lastConnection = 0; /* Timestampnumber. Tiempo en epoch */
}

ApplicationServer.fromObj = function (obj) {
    if (obj) {
        const appServer = new ApplicationServer();
        Object.keys(obj).map(key => appServer[key] = obj[key]);
        appServer.createdBy = new Date(appServer.createdBy);
        appServer.lastConnection = new Date(appServer.lastConnection);
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

    dbManager.query(`INSERT INTO ${table} (id,_ref,created_by,name)
        VALUES ($1,$2,$3,$4) RETURNING *`,
        [id, _ref, createdBy, name], callback);
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