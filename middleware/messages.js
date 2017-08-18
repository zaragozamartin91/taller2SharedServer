const express = require('express');

/*The express.response object is the prototype that Express uses, for the response objects. Adding properties to this object means 
they’ll then be available to all middleware and routes alike*/
const res = express.response;

/*La siguiente funcion expande las funcionalidades de express response agregando el metodo "message" el cual agrega un mensaje a 
req.session.messages*/
res.message = function (msg, type) {
    type = type || 'info';
    let sess = this.req.session;
    sess.messages = sess.messages || [];
    sess.messages.push({
        type: type,
        string: msg
    });
};

/*La siguiente funcion agrega un metodo "error" a todos los express.response permitiendo agregar mensajes de tipo error a la lista
de mensajes de la sesion.*/
res.error = function (msg) {
    return this.message(msg, 'error');
};
res.danger = function (msg) {
    return this.message(msg, 'danger');
};

res.success = function (msg) {
    return this.message(msg, 'success');
};

res.warning = function (msg) {
    return this.message(msg, 'warning');
};
res.info = function (msg) {
    return this.message(msg, 'info');
};

/*El siguiente middleware carga en res.locals los mensajes de la sesion y agrega en res.locals una funcion para eliminar/limpiar
mensajes. Las variables de res.locals son expuestas a los Templates.*/
module.exports = function (req, res, next) {
    res.locals.messages = req.session.messages || [];
    res.locals.removeMessages = () => req.session.messages = [];
    res.locals.message = res.locals.messages[0] ? res.locals.messages[0] : null;

    console.log("res.locals.messages: " + res.locals.messages);
    next();
};