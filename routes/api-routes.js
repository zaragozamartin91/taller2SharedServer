const express = require('express');
const serverController = require('../controllers/server-controller');
const tokenController = require('../controllers/token-controller');
const tokenValidator = require('../middleware/token-validator');

const router = express.Router();

/** Api para obtener y reproducir el audio de una cancion */
router.get('/test', function (req, res) {
    res.send({
        id: 1234,
        name: 'respuesta de prueba',
        tokens: [12.54, 'pepe']
    });
});

router.post('/token', tokenController.generateToken);

/* /servers ROUTES ---------------------------------------------------------------------------------------------------- */
router.use('/servers', tokenValidator.verifyToken);
router.get('/servers', serverController.getServers);
router.post('/servers', serverController.postServer);
router.delete('/servers/:serverId?', serverController.deleteServer);
router.put('/servers/:serverId?', serverController.updateServer);

module.exports = router;