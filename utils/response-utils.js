/**
 * Envia una respuesta de tipo error.
 * @param {Response} res Objeto respuesta http.
 * @param {string} message Mensaje a enviar.
 * @param {number} code Codigo de error.
 */
function sendErrResponse(res, message, code) {
    res.status(code);
    res.send({ code, message });
}

exports.sendErrResponse = sendErrResponse;