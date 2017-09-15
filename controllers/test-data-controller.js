const dbManager = require('../model/db-manager');
const BusinessUser = require('../model/BusinessUser');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');
const TokenModel = require('../model/Token');

const tableManager = require('../model/table-manager');
const flow = require('nimble');

const logger = require('log4js').getLogger('test-data-controller');

exports.createTestData = function (req, res) {
    flow.series([
        callback => {
            logger.debug('Creando tabla de tokens');
            tableManager.createTokenTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios');
            tableManager.createBusinessUserTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles');
            tableManager.createRoleTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de roles de usuario');
            tableManager.createBusinessUserRolesTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de servers');
            tableManager.createApplicationServerTable(() => callback());
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