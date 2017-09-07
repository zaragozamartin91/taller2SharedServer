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

/* /servers ROUTES -------------------------------------------------------------------------------------------------------------- */
// Agrego el middleware para parsear y deocdificar el token
router.use('/servers', tokenValidator.verifyToken);

// Agrego el middleware para validar que el usuario sea user
router.get('/servers', tokenValidator.verifyUserToken, serverController.getServers);

// Agrego el middleware para validar que el usuario sea manager
router.post('/servers', tokenValidator.verifyManagerToken, serverController.postServer);
router.delete('/servers/:serverId?', tokenValidator.verifyManagerToken, serverController.deleteServer);
router.put('/servers/:serverId?', tokenValidator.verifyManagerToken, serverController.updateServer);

/* FIN servers ROUTES ----------------------------------------------------------------------------------------------------------- */


/* /business-users ROUTES ------------------------------------------------------------------------------------------------------- */

router.use('/business-users', tokenValidator.verifyToken);

// Agrego el middleware para validar que el usuario sea admin
router.post('/business-users', tokenValidator.verifyAdminToken, businessUsersController.postUser);
router.put('/business-users/:userId', tokenValidator.verifyAdminToken, businessUsersController.updateUser);
router.get('/business-users', tokenValidator.verifyAdminToken, businessUsersController.getUsers);

/* FIN /business-users ROUTES ---------------------------------------------------------------------------------------------------- */

module.exports = router;