const Rule = require('../model/Rule');
const BusinessUser = require('../model/BusinessUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');

const sendMsgCodeResponse = responseUtils.sendMsgCodeResponse;
const apiVersion = mainConf.apiVersion;

/* TODO : AGREGAR VALIDACIONES DE REGLA A POSTEAR */
exports.postRule = function (req, res) {
    const userId = req.userId;
    const ruleObj = req.body;

    BusinessUser.findById(userId, (err, dbUser) => {
        if (err) return sendMsgCodeResponse(res, 'Error al obtener el usuario de la BBDD', 500);
        if (!dbUser) return sendMsgCodeResponse(res, 'El usuario no existe', 404);

        ruleObj.lastCommit = { author: userId, message: '' };
        Rule.insert(ruleObj, (err, dbRule) => {
            if (err) return sendMsgCodeResponse(res, 'Error al insertar la regla en la BBDD', 500);

            const { id, _ref, username, name, surname, roles } = dbUser;
            dbRule.lastCommit.author = { id, _ref, username, name, surname, roles };

            const metadata = { version: apiVersion };
            res.send({ metadata, rule: dbRule });
        });
    });
};

exports.estimate = function(req, res) {
    
};