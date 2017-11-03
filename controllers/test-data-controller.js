const dbManager = require('../model/db-manager');
const BusinessUser = require('../model/BusinessUser');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');
const TokenModel = require('../model/Token');
const ApplicationUser = require('../model/ApplicationUser');
const Car = require('../model/Car');
const Trip = require('../model/Trip');
const Rule = require('../model/Rule');
const Hit = require('../model/Hit');
const ruleHandler = require('../utils/rule-handler');

const tableManager = require('../model/table-manager');
const tokenManager = require('../utils/token-manager');
const flow = require('nimble');
const moment = require('moment');

const logger = require('log4js').getLogger('test-data-controller');

exports.createTestData = function (req, res) {
    flow.series([
        callback => {
            logger.debug('Creando tabla de tokens');
            tableManager.createTokensTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios de negocio');
            tableManager.createBusinessUsersTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de servers');
            tableManager.createApplicationServersTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de usuarios de aplicacion');
            tableManager.createApplicationUsersTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de autos');
            tableManager.createCarsTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de viajes');
            tableManager.createTripsTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de reglas');
            tableManager.createRulesTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de commits de reglas');
            tableManager.createRuleCommitsTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de transacciones');
            tableManager.createTransactionsTable(() => callback());
        },
        callback => {
            logger.debug('Creando tabla de hits');
            tableManager.createHitTable(() => callback());
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
                            [{ currency: 'ARS', value: 123.45 }, { currency: 'USD', value: 6789.10 }]
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
                            [{ currency: 'ARS', value: 5000 }, { currency: 'EUR', value: 45678.98 }]
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
                            [{ currency: 'ARS', value: 6789 }, { currency: 'USD', value: 123321 }]
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
                            [{ currency: 'ARS', value: 1111 }]
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
            const p1 = new Promise(resolve => ApplicationUser.findByUsernameAndApp('mzaragoza', 'llevame', (err, user) => resolve(user)));
            const p2 = new Promise(resolve => ApplicationUser.findByUsernameAndApp('quelopario', 'llevame', (err, user) => resolve(user)));
            Promise.all([p1, p2]).then(([user1, user2]) => {
                const driver = user1.isDriver() ? user1 : user2;
                const passenger = user1.isPassenger() ? user1 : user2;
                const start = {
                    'address': { 'street': 'Sto domingo 1180', 'location': { 'lat': -34.497956, 'lon': -58.534823 } },
                    'timestamp': moment().toDate().getTime()
                };
                const end = {
                    'address': { 'street': 'Av. Cordoba 673', 'location': { 'lat': -34.598282, 'lon': -58.376498 } },
                    'timestamp': moment().add(35, 'm').toDate().getTime()
                };
                const route = [];
                const cost = {
                    'currency': 'ARS',
                    'value': 123.25
                };
                const tripObj = new Trip(null, 'llevame', driver.id, passenger.id, start, end, 60 * 35, 60 * 5, 60 * 30, 2500, route, cost);

                console.log('Insertando viaje');
                Trip.insert(tripObj, (err, dbTrip) => {
                    if (err) console.error(err);
                    callback();
                });
            });

        },

        callback => {
            console.log('Insertando reglas');
            const jsonRules = ruleHandler.toJson(ruleHandler.BASE_RULES);
            jsonRules.forEach(jsonRule => {
                jsonRule.condition = jsonRule.condition.replace(/\r/g, '').replace(/\n */g, '');
                jsonRule.consequence = jsonRule.consequence.replace(/\r/g, '').replace(/\n */g, '');
            });

            const ruleObjs = jsonRules.map(jsonRule => {
                return {
                    'author': 'martin',
                    'message': 'New rule',
                    'blob': jsonRule,
                    'active': true
                };
            });

            const promises = ruleObjs.map(ruleObj => new Promise(resolve => {
                Rule.insert(ruleObj, (err, dbRule) => {
                    if (err) console.error(err);
                    else console.log('Regla ' + dbRule.id + ' insertada!');
                    resolve();
                });
            }));

            Promise.all(promises).then(() => {
                console.log('Reglas insertadas');
                callback();
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
            logger.debug('Eliminando tabla de hits');
            tableManager.dropHitTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de transacciones');
            tableManager.dropTransactionsTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de viajes');
            tableManager.dropTripsTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de autos');
            tableManager.dropCarsTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de usuarios de aplicacion');
            tableManager.dropApplicationUsersTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de tokens');
            tableManager.dropTokensTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de servers');
            tableManager.dropApplicationServersTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de commits de reglas');
            tableManager.dropRuleCommitsTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de reglas');
            tableManager.dropRulesTable(() => callback());
        },
        callback => {
            logger.debug('Eliminando tabla de usuarios de negocio');
            tableManager.dropBusinessUsersTable(() => callback());
        },
        callback => {
            logger.debug('Fin');
            res.send({ code: 200, message: 'Tablas eliminadas' });
        },
    ]);
};