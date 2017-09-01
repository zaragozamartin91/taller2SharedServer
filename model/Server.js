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

