const express = require('express');
const serverController = require('../controllers/server-controller');
const tokenController = require('../controllers/token-controller');
const tokenValidator = require('../middleware/token-validator');
const businessUsersController = require('../controllers/business-user-controller');
const appUserController = require('../controllers/app-user-controller');

const testDataController = require('../controllers/test-data-controller');
const paymethodsController = require('../controllers/paymethods-controller');
const tripsController = require('../controllers/trips-controller');

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

router.post('/servers/ping', serverController.renewToken);

// Agrego el middleware para parsear y deocdificar el token
router.use('/servers', tokenValidator.verifyToken);

// Agrego el middleware para validar que el usuario sea user
router.get('/servers', tokenValidator.verifyUserToken, serverController.getServers);
router.get('/servers/:serverId', tokenValidator.verifyUserToken, serverController.getServer);

// Agrego el middleware para validar que el usuario sea manager
router.post('/servers', tokenValidator.verifyManagerToken, serverController.postServer);
router.delete('/servers/:serverId', tokenValidator.verifyManagerToken, serverController.deleteServer);
router.put('/servers/:serverId', tokenValidator.verifyManagerToken, serverController.updateServer);

router.post('/servers/:serverId', tokenValidator.verifyManagerToken, serverController.resetToken);


/* FIN servers ROUTES ----------------------------------------------------------------------------------------------------------- */


/* /business-users ROUTES ------------------------------------------------------------------------------------------------------- */

router.use('/business-users', tokenValidator.verifyToken);

// Agrego el middleware para validar que el usuario sea admin
router.post('/business-users', tokenValidator.verifyAdminToken, businessUsersController.postUser);

// EL ORDEN DE ESTOS ENDPOINTS ES FUNDAMENTAL
router.put('/business-users/me', tokenValidator.verifyUserToken, businessUsersController.updateMyUser);
router.put('/business-users/:userId', tokenValidator.verifyAdminToken, businessUsersController.updateUser);

router.get('/business-users', tokenValidator.verifyAdminToken, businessUsersController.getUsers);
router.delete('/business-users/:userId', tokenValidator.verifyAdminToken, businessUsersController.deleteUser);

// EL ORDEN DE ESTOS ENDPOINTS ES FUNDAMENTAL
router.get('/business-users/me', tokenValidator.verifyUserToken, businessUsersController.getMyUser);
router.get('/business-users/:userId', tokenValidator.verifyUserToken, businessUsersController.getUser);

/* FIN /business-users ROUTES ---------------------------------------------------------------------------------------------------- */


/* /users ROUTES ------------------------------------------------------------------------------------------------------- */

router.use('/users', tokenValidator.verifyToken);

router.get('/users', tokenValidator.verifyServerOrRoleToken('user'), appUserController.getUsers);
router.get('/users/:userId', tokenValidator.verifyServerOrRoleToken('user'), appUserController.getUser);
router.post('/users', tokenValidator.verifyServerToken, appUserController.postUser);
router.delete('/users/:userId', tokenValidator.verifyServerOrRoleToken('manager'), appUserController.deleteUser);
router.post('/users/validate', tokenValidator.verifyServerToken, appUserController.validateUser);
router.put('/users/:userId', tokenValidator.verifyServerToken, appUserController.updateUser);

router.get('/users/:userId/cars', tokenValidator.verifyServerOrRoleToken('user'), appUserController.getUserCars);
router.post('/users/:userId/cars', tokenValidator.verifyServerToken, appUserController.postUserCar);
router.delete('/users/:userId/cars/:carId', tokenValidator.verifyServerOrRoleToken('manager'), appUserController.deleteUserCar);
router.get('/users/:userId/cars/:carId', tokenValidator.verifyServerOrRoleToken('user'), appUserController.getUserCar);
router.put('/users/:userId/cars/:carId', tokenValidator.verifyServerToken, appUserController.updateUserCar);

/* FIN /users ROUTES ---------------------------------------------------------------------------------------------------- */

/* /paymethods ROUTES ------------------------------------------------------------------------------------------------------- */
router.use('/paymethods', tokenValidator.verifyToken);
router.get('/paymethods', tokenValidator.verifyServerOrRoleToken('user'), paymethodsController.getPaymethods);
/* FIN /paymethods ROUTES ------------------------------------------------------------------------------------------------------- */


/* /trips ROUTES ------------------------------------------------------------------------------------------------------- */
router.use('/trips', tokenValidator.verifyToken);
router.get('/trips/:tripId', tokenValidator.verifyServerOrRoleToken('user'), tripsController.getTrip);
router.get('/trips', tokenValidator.verifyServerOrRoleToken('user'), tripsController.getTrips);

/* FIN /trips ROUTES ------------------------------------------------------------------------------------------------------- */

module.exports = router;

/* CREA LOS DATOS DE PRUEBA DE LA APP */
router.post('/test-data', testDataController.createTestData);
router.delete('/test-data', testDataController.deleteTestData);

/* RUTAS EXCLUSIVAS PARA PROBAR EL SERVER DE PYTHON */

const TokenModel = require('../model/Token');
router.get('/llevame', (req, res) => {
    console.log(req.header('Authorization'));
    TokenModel.findByOwner('llevame', (err, token) => {
        token = token || {};
        res.send(token);
    });
});