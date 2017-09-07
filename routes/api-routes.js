const express = require('express');
const serverController = require('../controllers/server-controller');
const tokenController = require('../controllers/token-controller');
const tokenValidator = require('../middleware/token-validator');
const businessUsersController = require('../controllers/business-user-controller');

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
// Agrego el middleware para parsear y deocdificar el token
router.use('/servers', tokenValidator.verifyToken);

// Agrego el middleware para validar que el usuario sea user
router.get('/servers', tokenValidator.verifyUserToken);
router.get('/servers', serverController.getServers);

/* RUTAS DE MANAGER---------------------------------------------------------------- */

// Agrego el middleware para validar que el usuario sea manager
router.post('/servers', tokenValidator.verifyManagerToken);
router.post('/servers', serverController.postServer);
// Agrego el middleware para validar que el usuario sea manager
router.delete('/servers/:serverId?', tokenValidator.verifyManagerToken);
router.delete('/servers/:serverId?', serverController.deleteServer);
// Agrego el middleware para validar que el usuario sea manager
router.put('/servers/:serverId?', tokenValidator.verifyManagerToken);
router.put('/servers/:serverId?', serverController.updateServer);

/* FIN servers ROUTES ---------------------------------------------------------------------------------------------------- */


/* /business-users ROUTES ---------------------------------------------------------------------------------------------------- */

router.use('/business-users', tokenValidator.verifyToken);

router.post('/business-users', tokenValidator.verifyAdminToken);
router.post('/business-users', businessUsersController.postUser);

router.put('/business-users/:userId', tokenValidator.verifyAdminToken);
router.put('/business-users/:userId', businessUsersController.updateUser);

/* FIN /business-users ROUTES ---------------------------------------------------------------------------------------------------- */

module.exports = router;