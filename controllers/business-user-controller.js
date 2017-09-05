const BusinessUser = require('../model/BusinessUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');

const apiVersion = mainConf.apiVersion;


exports.postUser = function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const surname = req.body.surname;
    const roles = req.body.roles || [];

    if (!username || !password || !name || !surname)
        return responseUtils.sendMsgCodeResponse(res, 'Faltan parametros', 400);

    const userObj = { username, password, name, surname };
    BusinessUser.insert(userObj, (err, usr) => {
        if (err) return responseUtils.sendMsgCodeResponse(res, 'Error al insertar usuario', 500);

        BusinessUser.addRoles(usr, roles, (err, res) => {
            if (err) responseUtils.sendMsgCodeResponse(res, 'Ocurrio un error al agregar los roles al usuario', 500);

            /* Construyo el json de salida. Al user object obtenido de la query, le agrego el arreglo de roles. */
            usr.roles = roles;
            const metadata = { version: apiVersion };
            res.send({ metadata, businessUser: usr });
        });
    });
};