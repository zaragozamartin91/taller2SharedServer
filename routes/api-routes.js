const express = require('express');
const managerController = require('../controllers/manager-controller');
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

router.post('/token', managerController.generateToken);

router.use('/servers', tokenValidator.verifyToken);
router.get('/servers', managerController.getServers);
router.post('/servers', managerController.postServer);

module.exports = router;