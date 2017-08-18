const express = require('express');
const router = express.Router();
const path = require('path');
/* formidable se usa para el manejo de formularios con archivos */
const formidable = require('formidable');

/* este modulo sirve para manejar archivos */
const filesystem = require("fs");

/* este modulo parsea urls */
const url = require('url');
const GlobalConfig = require('../GlobalConfig');

/* TODAS LAS RUTAS DE TIPO API TIENEN EL PREFIJO /api INCORPORADO AUTOMATICAMENTE  */


/** Api para obtener y reproducir el audio de una cancion */
router.get('/test', function (req, res) {
    res.send({
        id: 1234,
        name: 'respuesta de prueba',
        tokens: [12.54, 'pepe']
    });
});


/* EL SIGUIENTE ES UN EJEMPLO DE COMO USAR FORMIDABLE...*/
//router.post('/song/upload/:band', (req, res, next) => {
//    console.log(`req.params.band: ${req.params.band}`);
//    console.log(`SONGS DIR: ${songsDir}`);
//
//    let form = new formidable.IncomingForm();
//
//    form.on('fileBegin', function (name, file) {
//        console.log("fileBegin!");
//        file.path = path.join(songsDir, file.name);
//        console.log(`file.path: ${file.path}`);
//    });
//
//    form.on('file', function (name, file) {
//        console.log('Uploaded ' + file.name);
//        res.send({ msg: `file ${file.name} uploaded!` });
//    });
//
//    form.on('field', (field, value) => {
//        console.log(`field: ${field} ; value: ${value}`);
//    });
//
//    form.parse(req);
//});

module.exports = router;