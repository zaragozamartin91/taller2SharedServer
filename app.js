const express = require('express');
const path = require('path');
const fs = require('fs')
const favicon = require('serve-favicon');
const log4js = require('log4js');
const bodyParser = require('body-parser');

const session = require('express-session');
//const SessionManager = require('./model/SessionManager');
const messages = require('./middleware/messages');

const viewRoutes = require('./routes/view-routes');
const apiRoutes = require('./routes/api-routes');

/* ------------------------------------------------------------------------------------------- */

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

/* CONFIGURACION DE LOGS ------------------------------------------------------------------------ */

let logDirectory = path.join(__dirname, 'log')
// Verificamos que el directorio log/ exista 
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

log4js.configure(path.join(__dirname, "config", "log4js.json"));
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));

/* CONFIGURACION DE MIDDLEWARE DE PARSEO DE BODY ------------------------------------------------------------------------ */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* CONFIGURACION DE SESION ------------------------------------------------------------------------ */
/* PARA MAS INFORMACION SOBRE LA CONFIGURACION DE LA SESION, VISITAR:
https://github.com/expressjs/session  */


/* PARA MAS INFORMACION SOBRE SESSION STORES, VISITAR:
https://github.com/expressjs/session#compatible-session-stores
https://www.npmjs.com/package/express-mysql-session  
https://www.npmjs.com/package/connect-mongo */
/* Las cookies duraran una hora */
const cookieMaxAge = 1000 * 60 * 60;
const sess = {
  secret: 'taller2 shared server',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: cookieMaxAge
  }
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));

/* CONFIGURACION DE PATHS -------------------------------------------------------------------------- */

/* LOS RECURSOS ESTATICOS DEBEN ACCEDERSE USANDO EL PATH APROPIADO. 
NO ES POSIBLE NAVEGARLOS COMO ESTRUCTURA DE DIRECTORIO */
app.use(express.static('public'));

/* MIDDLEWARE PARA EL MANEJO DE MENSAJES */
app.use(messages);

/* RUTAS */
app.use('/', viewRoutes);
app.use('/api', apiRoutes);

/* MANEJO DE ERRORES ------------------------------------------------------------------------------ */

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  console.log("DEVELOPMENT ENVIRONMET ENABLED");
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

/* La instruccion del puerto fue modificada para hacer un deploy correcto 
de la app en heroku. https://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of */
let port = process.env.PORT || 5000;
console.log(`ESCUCHANDO EN PUERTO ${port}`);
app.listen(port);

