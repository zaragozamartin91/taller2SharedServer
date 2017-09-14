const dbManager = require('../model/db-manager');
const BusinessUser = require('../model/BusinessUser');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');
const TokenModel = require('../model/Token');
const flow = require('nimble');

const logger = require('log4js').getLogger('test-data-controller');

exports.createTestData = function (req, res) {
    flow.series([
        callback => {
            logger.debug('Creando tabla de tokens');
            TokenModel.createTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios');
            BusinessUser.createTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles');
            Role.createTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles de usuario');
            BusinessUser.createRolesTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de servers');
            ApplicationServer.createTable(() => callback());
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
                ApplicationServer.insert({ name: 'oneApp', createdBy: user.id }, () => callback());
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
            logger.debug('Eliminando tabla de tokens');
            TokenModel.dropTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de servers');
            ApplicationServer.dropTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de roles de usuario de negocio');
            BusinessUser.dropRolesTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de roles');
            Role.dropTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de usuarios de negocio');
            BusinessUser.dropTable(() => callback());
        },
        callback => {
            logger.debug('Fin');
            res.send({ code: 200, message: 'Tablas eliminadas' });
        },
    ]);
};