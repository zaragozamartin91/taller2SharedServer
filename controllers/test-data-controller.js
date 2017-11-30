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

const testDataGenerator = require('../utils/test-data-generator');

let BUSINESS_USERS = [];
let APP_SERVERS = [];


exports.createTestData = function (req, res) {
    flow.series([
        callback => {
            BUSINESS_USERS = [];
            APP_SERVERS = [];
            callback();
        },
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
                username: 'martin', password: 'pepe', name: 'Martin', surname: 'Zaragoza', roles: ['manager', 'admin', 'user']
            }, (err, user) => {
                BUSINESS_USERS.push(user);
                callback();
            });
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({
                username: 'mateo', password: 'posting', name: 'Mateo', surname: 'Zaragoza', roles: ['user', 'admin']
            }, (err, user) => {
                BUSINESS_USERS.push(user);
                callback();
            });
        },
        callback => {
            logger.debug('Insertando usuario');
            BusinessUser.insert({ username: 'hector', password: 'rules', name: 'Hector', surname: 'Zaragoza' }, (err, user) => {
                BUSINESS_USERS.push(user);
                callback();
            });
        },

        callback => {
            logger.debug('Agregando app server');
            const user = BUSINESS_USERS[0];

            ApplicationServer.insert({ name: 'Llevame', createdBy: user.id, url: 'http://taller2-application-server.herokuapp.com/api/v1' }, (err, server) => {
                logger.debug('Agregando token de servidor ' + server.name);
                const token = tokenManager.signServer(server);
                TokenModel.insert(token, server.id, err => {
                    if (err) logger.error(err);
                });

                APP_SERVERS.push(server);
                server.passengers = [];
                server.drivers = [];

                const p1 = new Promise(resolve => {
                    logger.debug('Agregando usuario de aplicacion');
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
                        [{ currency: 'ARS', value: 123.45 }, { currency: 'USD', value: 6789.10 }, { currency: 'EUR', value: 678 }]
                    ];
                    let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                    ApplicationUser.insert(userObj, (err, user) => {
                        logger.debug('Agregando auto a usuario');
                        let [owner, properties] = [user.id, [{ name: 'model', value: 'renault' }, { name: 'year', value: 2001 }]];
                        server.drivers.push(user);

                        Car.insert({ owner, properties }, (err, res) => {
                            logger.debug('Auto insertado');
                            logger.debug('Usuario ' + username + ' insertado');
                            resolve(user);
                        });
                    });
                });

                const p2 = new Promise(resolve => {
                    logger.debug('Agregando usuario de aplicacion');
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
                        [{ currency: 'ARS', value: 5000 }, { currency: 'USD', value: 1 }, { currency: 'EUR', value: 45678.98 }]
                    ];
                    let userObj = { applicationOwner, username, password, name, surname, country, email, birthdate, type, images, balance };
                    ApplicationUser.insert(userObj, (err, user) => {
                        logger.debug('Usuario ' + username + ' insertado');
                        server.passengers.push(user);
                        resolve(user);
                    });
                });

                const promises = [p1, p2];
                for (let i = 0; i < 5; i++) {
                    promises.push(new Promise(resolve => {
                        logger.debug('Agregando usuario de aplicacion');
                        const userObj = testDataGenerator.generatePassenger(server);

                        ApplicationUser.insert(userObj, (err, user) => {
                            logger.debug(`Usuario ${userObj.username} insertado`);
                            server.passengers.push(user);
                            resolve(user);
                        });
                    }));
                }

                Promise.all(promises).then(fulfilled => callback());
            });

        },

        callback => {
            logger.debug('Agregando app server');
            BusinessUser.findByUsername('martin', (err, user) => {
                ApplicationServer.insert({ name: 'Super Taxi', createdBy: user.id }, (err, server) => {

                    APP_SERVERS.push(server);
                    server.passengers = [];
                    server.drivers = [];


                    logger.debug('Agregando token de servidor ' + server.name);
                    const token = tokenManager.signServer(server);
                    TokenModel.insert(token, server.id, err => {
                        if (err) logger.error(err);
                    });

                    const p1 = new Promise(resolve => {
                        logger.debug('Agregando usuario de aplicacion');
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
                            logger.debug('Agregando auto a usuario');
                            let [owner, properties] = [user.id, [{ name: 'model', value: 'ford' }, { name: 'year', value: 2007 }]];

                            server.drivers.push(user);

                            Car.insert({ owner, properties }, (err, res) => {
                                logger.debug('Auto insertado');
                                logger.debug('Usuario ' + username + ' insertado');
                                resolve(user);
                            });
                        });
                    });

                    const p2 = new Promise(resolve => {
                        logger.debug('Agregando usuario de aplicacion');
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
                            server.passengers.push(user);
                            logger.debug('Usuario ' + username + ' insertado');
                            resolve(user);
                        });
                    });

                    Promise.all([p1, p2]).then(fulfilled => callback());
                });
            });
        },

        callback => {
            logger.debug('Insertando viajes');

            const server = APP_SERVERS[0];
            const driver = APP_SERVERS[0].drivers[0];
            const passenger = APP_SERVERS[0].passengers[0];

            const promises = [];
            for (let i = 0; i < server.passengers.length; i++) {
                const tripCount = 3 - i > 0 ? 3 - i : 0;

                for (let j = 0; j < tripCount; j++) {
                    const tripObj = testDataGenerator.generateTrip(server, driver, server.passengers[i]);
                    promises.push(new Promise(resolve => {
                        Trip.insert(tripObj, (err, trip) => {
                            logger.debug(`Viaje ${trip.id} insertado`);
                            resolve(trip);
                        });
                    }));
                }
            }

            Promise.all(promises).then(fulfilled => callback());
        },

        callback => {
            logger.debug('Insertando reglas');
            const jsonRules = ruleHandler.toJson(ruleHandler.BASE_RULES);
            jsonRules.forEach(jsonRule => {
                jsonRule.condition = jsonRule.condition.replace(/\r/g, '').replace(/\n */g, '');
                jsonRule.consequence = jsonRule.consequence.replace(/\r/g, '').replace(/\n */g, '');
            });

            let priority = 1;
            const ruleObjs = jsonRules.map(jsonRule => {
                return {
                    'author': 'martin',
                    'message': 'New rule',
                    'blob': jsonRule,
                    'active': true,
                    'priority': priority++
                };
            });

            const promises = ruleObjs.map(ruleObj => new Promise(resolve => {
                Rule.insert(ruleObj, (err, dbRule) => {
                    if (err) logger.error(err);
                    else logger.debug('Regla ' + dbRule.id + ' insertada!');
                    resolve();
                });
            }));

            Promise.all(promises).then(() => {
                logger.debug('Reglas insertadas');
                callback();
            });
        },

        /*
        callback => {
            logger.debug('Agregando hits de prueba');
            const promises = [];
            for (let h = 0; h < 24; h++) {
                const shour = h < 10 ? `0${h}:15` : `${h}:45`;
                const [server, method, url, hour] = [APP_SERVERS[0].id, 'GET', '/users', shour];

                promises.push(new Promise((resolve, reject) => {
                    Hit.insertOnTime({ server, method, url, hour }, (err, hit) => {
                        if (err) console.error(err);
                        resolve(hit);
                    });
                }));
            }

            promises.push(new Promise((resolve, reject) => {
                Hit.insertOnTime({ server: APP_SERVERS[0].id, method: 'POST', url: '/ping', hour: '12:30' }, (err, hit) => {
                    if (err) console.error(err);
                    resolve(hit);
                });
            }));

            promises.push(new Promise((resolve, reject) => {
                Hit.insertOnTime({ server: APP_SERVERS[0].id, method: 'POST', url: '/ping', hour: '12:30' }, (err, hit) => {
                    if (err) console.error(err);
                    resolve(hit);
                });
            }));

            promises.push(new Promise((resolve, reject) => {
                Hit.insertOnTime({ server: APP_SERVERS[0].id, method: 'POST', url: '/ping', hour: '15:30' }, (err, hit) => {
                    if (err) console.error(err);
                    resolve(hit);
                });
            }));

            promises.push(new Promise((resolve, reject) => {
                Hit.insertOnTime({ server: APP_SERVERS[0].id, method: 'POST', url: '/ping', hour: '16:30' }, (err, hit) => {
                    if (err) console.error(err);
                    resolve(hit);
                });
            }));

            Promise.all(promises).then(() => callback());
        },
        */

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