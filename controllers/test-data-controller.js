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
            logger.debug('Insertando usuario');
            BusinessUser.insert({
                username: 'martin', password: 'pepe', name: 'Martin',
                surname: 'Zaragoza', roles: ['manager', 'admin', 'user']
            }, () => callback());
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({
                username: 'mateo', password: 'posting', name: 'Mateo',
                surname: 'Zaragoza', roles: ['user', 'admin']
            }, () => callback());
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({ username: 'hector', password: 'rules', name: 'Hector', surname: 'Zaragoza' }, () => callback());
        },

        callback => {
            logger.debug('Agregando app server');
            BusinessUser.findByUsername('martin', (err, user) => {
                ApplicationServer.insert({ name: 'Llevame', createdBy: user.id }, (err, server) => {
                    console.log('Agregando token de servidor ' + server.name);
                    const token = tokenManager.signServer(server);
                    TokenModel.insert(token, server.id, err => {
                        if (err) console.error(err);
                    });

                    const p1 = new Promise(resolve => {
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
                            Car.insert({ owner, properties }, (err, res) => {
                                console.log('Auto insertado');
                                console.log('Usuario ' + username + ' insertado');
                                resolve(user);
                            });
                        });
                    });

                    const p2 = new Promise(resolve => {
                        console.log('Agregando usuario de aplicacion');
                        let [applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance] = [
                            server.id,
                            'quelopario',
                            'posting',
                            'Hector',
                            'Zaragoza',
                            'Argentina',
                            'quelopario@gmail.com',
                            moment('1960-09-18').toDate(),
                            'passenger',
                            ['https://www.postgresql.org/docs/9.6/static/datatype-json.html', 'https://docs.google.com/document/d/1Ekd8ohj2WdSd5gg4_s4SGvP3P65CLb69U4-5fMBab4o/'],
                            [{ currency: 'peso', value: 5000 }, { currency: 'euro', value: 45678.98 }]
                        ];
                        let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                        ApplicationUser.insert(userObj, (err, user) => {
                            console.log('Usuario ' + username + ' insertado');
                            resolve(user);
                        });
                    });

                    Promise.all([p1, p2]).then(fulfilled => callback());
                });
            });
        },

        callback => {
            logger.debug('Agregando app server');
            BusinessUser.findByUsername('martin', (err, user) => {
                ApplicationServer.insert({ name: 'Super Taxi', createdBy: user.id }, (err, server) => {
                    console.log('Agregando token de servidor ' + server.name);
                    const token = tokenManager.signServer(server);
                    TokenModel.insert(token, server.id, err => {
                        if (err) console.error(err);
                    });

                    const p1 = new Promise(resolve => {
                        console.log('Agregando usuario de aplicacion');
                        let [applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance] = [
                            server.id,
                            'efidalgo',
                            'rules',
                            'Exequiel',
                            'Fidalgo',
                            'Argentina',
                            'efidalgo_123@accusys.com',
                            moment('1991-06-17').toDate(),
                            'driver',
                            [],
                            [{ currency: 'peso', value: 6789 }, { currency: 'dolar', value: 123321 }]
                        ];
                        let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                        ApplicationUser.insert(userObj, (err, user) => {
                            console.log('Agregando auto a usuario');
                            let [owner, properties] = [user.id, [{ name: 'model', value: 'ford' }, { name: 'year', value: 2007 }]];
                            Car.insert({ owner, properties }, (err, res) => {
                                console.log('Auto insertado');
                                console.log('Usuario ' + username + ' insertado');
                                resolve(user);
                            });
                        });
                    });

                    const p2 = new Promise(resolve => {
                        console.log('Agregando usuario de aplicacion');
                        let [applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance] = [
                            server.id,
                            'rhuber',
                            'yes',
                            'Rolando',
                            'Huber',
                            'Argentina',
                            'rhuber@gmail.com',
                            moment('1993-10-01').toDate(),
                            'passenger',
                            ['https://www.postgresql.org/docs/9.6/static/datatype-json.html', 'https://docs.google.com/document/d/1Ekd8ohj2WdSd5gg4_s4SGvP3P65CLb69U4-5fMBab4o/'],
                            [{ currency: 'peso', value: 1111 }]
                        ];
                        let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                        ApplicationUser.insert(userObj, (err, user) => {
                            console.log('Usuario ' + username + ' insertado');
                            resolve(user);
                        });
                    });

                    Promise.all([p1, p2]).then(fulfilled => callback());
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
            logger.debug('Eliminando tabla de usuarios de negocio');
            tableManager.dropBusinessUserTable(() => callback());
        },
        callback => {
            logger.debug('Fin');
            res.send({ code: 200, message: 'Tablas eliminadas' });
        },
    ]);
};