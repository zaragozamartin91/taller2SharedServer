/**
 * Envia una respuesta de tipo error.
 * @param {Response} res Objeto respuesta http.
 * @param {string} message Mensaje a enviar.
 * @param {number} code Codigo de error.
 */
function sendMsgCodeResponse(res, message, code) {
    code = code || 200;
    res.status(code);
    res.send({ code, message });
}

exports.sendMsgCodeResponse = sendMsgCodeResponse;