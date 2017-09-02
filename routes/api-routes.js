const express = require('express');
const router = express.Router();

/* TODAS LAS RUTAS DE TIPO API TIENEN EL PREFIJO ASIGNADO POR GlobalConfig#getApiRoutePrefix INCORPORADO AUTOMATICAMENTE */

/** Api para obtener y reproducir el audio de una cancion */
router.get('/test', function (req, res) {
    res.send({
        id: 1234,
        name: 'respuesta de prueba',
        tokens: [12.54, 'pepe']
    });
});




module.exports = router;