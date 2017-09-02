const dbManager = require('./db-manager');

const table = 'application_server';

function Server() {
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

/* TODO : created_by TIENE QUE SER UNA REFERENCIA A UN BusinessUser?
created_time / last_conn, TIENEN QUE SER DE TIPO Date EN POSTGRES? */

Server.createTable = function (callback) {
    dbManager.query(`CREATE TABLE ${table} (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        _ref VARCHAR(256) NOT NULL,
        created_by VARCHAR(64) NOT NULL,
        created_time INT NOT NULL,
        name VARCHAR(64) NOT NULL,
        last_conn INT NOT NULL)`, [], callback);
};

module.exports = Server;