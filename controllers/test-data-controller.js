const dbManager = require('../model/db-manager');
const BusinessUser = require('../model/BusinessUser');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');
const TokenModel = require('../model/Token');
const ApplicationUser = require('../model/ApplicationUser');
const Car = require('../model/Car');

const tableManager = require('../model/table-manager');
const tokenManager = require('../utils/token-manager');
const flow = require('nimble');
const moment = require('moment');

const logger = require('log4js').getLogger('test-data-controller');

exports.createTestData = function (req, res) {
    flow.series([
        callback => {
            logger.debug('Creando tabla de tokens');
            tableManager.createTokenTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios de negocio');
            tableManager.createBusinessUserTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles');
            tableManager.createRoleTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles de usuario de negocio');
            tableManager.createBusinessUserRolesTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de servers');
            tableManager.createApplicationServerTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios de aplicacion');
            tableManager.createApplicationUserTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de autos');
            tableManager.createCarTable(() => callback());
        },
        callback => {
            logger.debug('Insertando rol');
            Role.insert('manager', () => callback());
        },
        callback => {
            logger.debug('Insertando rol');
            Role.insert('admin', () => callback());
        },
        callback => {
            logger.debug('Insertando rol');
            Role.insert('user', () => callback());
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({
                username: 'martin', password: 'pepe', name: 'martin',
                surname: 'zaragoza', roles: ['manager', 'admin', 'user']
            }, () => callback());
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({
                username: 'mateo', password: 'posting', name: 'mateo',
                surname: 'zaragoza', roles: ['user', 'admin']
            }, () => callback());
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({ username: 'hector', password: 'rules', name: 'hector', surname: 'zaragoza' }, () => callback());
        },
        callback => {
            logger.debug('Agregando app server');
            BusinessUser.findByUsername('martin', (err, user) => {
                ApplicationServer.insert({ name: 'oneApp', createdBy: user.id }, (err, server) => {
                    console.log('Agregando token de servidor');
                    const token = tokenManager.signServer(server);
                    TokenModel.insert(token, server.id, err => {
                        if (err) console.error(err);
                    });

                    console.log('Agregando usuario de aplicacion');
                    let [applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance] = [
                        server.id,
                        'mzaragoza',
                        'pepe',
                        'Martin',
                        'Zaragoza',
                        'Argentina',
                        'mzaragoza@accusys.com',
                        moment('1991-03-21').toDate(),
                        'driver',
                        ['https://www.postgresql.org/docs/9.6/static/datatype-json.html'],
                        [{ currency: 'peso', value: 123.45 }, { currency: 'dolar', value: 6789.10 }]
                    ];
                    let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                    ApplicationUser.insert(userObj, (err, user) => {
                        console.log('Agregando auto a usuario');
                        let [owner, properties] = [user.id, [{ name: 'model', value: 'renault' }, { name: 'year', value: 2001 }]];
                        Car.insert({ owner, properties }, (err, res) => callback());
                    });
                });
            });
        },



        callback => {
            logger.debug('Fin');
            res.send({ code: 200, message: 'Todos los datos creados!' });
        }
    ]);
};

exports.deleteTestData = function (req, res) {
    flow.series([
        callback => {
            logger.debug('Eliminando tabla de autos');
            tableManager.dropCarTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de usuarios de aplicacion');
            tableManager.dropApplicationUserTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de tokens');
            tableManager.dropTokenTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de servers');
            tableManager.dropApplicationServerTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de roles de usuario de negocio');
            tableManager.dropBusinessUserRolesTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de roles');
            tableManager.dropRoleTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de usuarios de negocio');
            tableManager.dropBusinessUserTable(() => callback());
        },
        callback => {
            logger.debug('Fin');
            res.send({ code: 200, message: 'Tablas eliminadas' });
        },
    ]);
};