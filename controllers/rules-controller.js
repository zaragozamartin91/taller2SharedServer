const Rule = require('../model/Rule');
const BusinessUser = require('../model/BusinessUser');
const responseUtils = require('../utils/response-utils');
const mainConf = require('../config/main-config');
const ruleHandler = require('../utils/rule-handler');

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

/**
 * Construye un fact a partir de un arreglo descriptivo del fact
 * @param {Array<string>} facts Descripcion de los hechos, ej: ['nombre:martin','edad:26']
 * @returns {any} Hecho.
 */
function buildFact(facts) {
    let superFact = '{';

    for (let curr = 0; curr < facts.length; curr++) {
        const f = facts[curr].blob;
        let key = f.split(':')[0].trim();
        let value = f.split(':')[1].trim();

        const keyQuoteMatch = key.match(/"\w+"/);
        if (!keyQuoteMatch) key = `"${key}"`;

        const singleQuoteValueMatch = value.match(/'(.+)'/);
        const doubleQuoteValueMatch = value.match(/"(.+)"/);
        const stringValueMatch = value.match(/(\D+)/);
        if (singleQuoteValueMatch) {
            value = `"${singleQuoteValueMatch[1]}"`;
        } else if (doubleQuoteValueMatch) {
            value = `"${doubleQuoteValueMatch[1]}"`;
        } else if (stringValueMatch) {
            value = `"${stringValueMatch[1]}"`;
        }

        if (curr == (facts.length - 1)) superFact += `${key}:${value}`;
        else superFact += `${key}:${value},`;
    }
    superFact += '}';
    return JSON.parse(superFact);
}
exports.buildFact = buildFact;

function parseFact(facts) {
    let fact = null;
    /* Si el primer fact es objeto se le trata como el fact principal */
    if (typeof facts[0].blob == 'object') fact = facts[0].blob;
    /* si el primer fact es string parseable como json, entonces se lo toma como el fact principal */
    if (!fact) try { fact = JSON.parse(facts[0].blob); } catch (error) { console.error('fact no es parseable'); }
    /* caso contrario, se construye el fact principal a partir del arreglo */
    if (!fact) try { fact = buildFact(facts); } catch (error) { console.error(error); }

    return fact;
}

/**
 * Crea una funcion para procesar el resultado del motor de reglas.
 * @param {Response} res HTTP response.
 * @returns {function} Funcion que procesa el resultado del motor de reglas y responde al cliente.
 */
function processResult(res) {
    return function (result) {
        const metadata = { version: apiVersion };
        if (result.cannotTravel) return res.send({
            metadata, facts: [{ language: Rule.DEFAULT_LANGUAGE, blob: 'El pasajero debe normalizar su situación de pago' }]
        });

        if (result.free) return res.send({
            metadata, facts: [{ language: Rule.DEFAULT_LANGUAGE, blob: 'Viaje gratis' }]
        });

        let amount = 0;
        result.operations.forEach(op => {
            amount = op(amount);
            console.log('amount: ' + amount);
        });
        console.log('Total: ' + amount);
        return res.send({ metadata, facts: [{ language: Rule.DEFAULT_LANGUAGE, blob: `Costo: ${amount}` }] });
    };
}

function processError(res) {
    return function (err) {
        if (err instanceof Error) sendMsgCodeResponse(res, err.message, 500);
        else sendMsgCodeResponse(res, err.message, err.code);
    };
}

exports.runRules = function (req, res) {
    const { rules, facts } = req.body;
    if (!rules || rules.length == 0) return sendMsgCodeResponse(res, 'No se indicaron reglas', 400);
    if (!facts || facts.length == 0) return sendMsgCodeResponse(res, 'No se indicaron hechos', 400);

    let fact = parseFact(facts);

    ruleHandler.checkFromJson(fact, rules)
        .then(processResult(res))
        .catch(processError(res));
};

exports.runRule = function (req, res) {
    const ruleId = req.params.ruleId;

    new Promise((resolve, reject) =>
        Rule.findById(ruleId, (err, rule) => err ? reject(err) : resolve(rule)))
        .then(rule => {
            if (!rule) return Promise.reject({ message: 'La regla no existe', code: 404 });
            if (!rule.active) return Promise.reject({ message: 'La regla no esta activa', code: 400 });

            const facts = req.body;
            const fact = parseFact(facts);
            return ruleHandler.checkFromJson(fact, [rule.blob]);
        })
        .then(processResult(res))
        .catch(processError(res));
};

exports.deleteRule = function (req, res) {
    const ruleId = req.params.ruleId;

    Rule.delete(ruleId, (err, rule) => {
        if (err) return sendMsgCodeResponse(res, err.message, 500);
        if (!rule) return sendMsgCodeResponse(res, 'La regla no existe', 404);
        sendMsgCodeResponse(res, 'Baja correcta', 204);
    });
};