const RuleEngine = require('node-rules');
const assert = require('assert');
const sinon = require('sinon');
const tripsController = require('../controllers/trips-controller');
const Trip = require('../model/Trip');
const ApplicationUser = require('../model/ApplicationUser');
const Rule = require('../model/Rule');
const Transaction = require('../model/Transaction');
const ruleHandler = require('../utils/rule-handler');
const paymentUtils = require('../utils/payment-utils');

let sandbox = null;

function mockErrRes(expectedCode) {
    return {
        status(code) { this.code = code; },
        send({ code, message }) {
            assert.ok(message);
            assert.equal(expectedCode, code);
        }
    };
}

function mockTrip_1() {
    return {
        "id": 1,
        "applicationOwner": "llevame",
        "driver": "llevame-mzaragoza",
        "passenger": "llevame-quelopario",
        "start": {
            "address": {
                "street": "Sto domingo 1180",
                "location": {
                    "lat": -34.497956,
                    "lon": -58.534823
                }
            },
            "timestamp": 1510180473210
        },
        "end": {
            "address": {
                "street": "Av. Cordoba 673",
                "location": {
                    "lat": -34.598282,
                    "lon": -58.376498
                }
            },
            "timestamp": 1510182573211
        },
        "totalTime": 2100,
        "waitTime": 300,
        "travelTime": 1800,
        "distance": 2500,
        "route": [
            {
                "location": {
                    "lat": -34.598593,
                    "lon": -58.376550
                },
                "timestamp": 1509238026692
            }
        ],
        "cost": {
            "currency": "ARS",
            "value": 123.25
        },
        "date": "2017-11-09T01:34:32.739Z"
    };
}

function mockTrip_2() {
    return {
        "id": 2,
        "applicationOwner": "llevame",
        "driver": "llevame-mzaragoza",
        "passenger": "llevame-quelopario",
        "start": {
            "address": {
                "street": "Sto domingo 1180",
                "location": {
                    "lat": -34.497956,
                    "lon": -58.534823
                }
            },
            "timestamp": 1509237426992
        },
        "end": {
            "address": {
                "street": "Maipu 1234",
                "location": {
                    "lat": -34.4978,
                    "lon": -58.497652
                }
            },
            "timestamp": 1509238026992
        },
        "totalTime": 600,
        "waitTime": 60,
        "travelTime": 540,
        "distance": 4300,
        "route": [
            {
                "location": {
                    "lat": -34.497999,
                    "lon": -58.534899
                },
                "timestamp": 1509238026692
            }
        ],
        "cost": {
            "currency": "ARS",
            "value": 350.25
        },
        "date": "2017-11-09T01:34:56.831Z"
    };
}

function mockInsertedTrip() {
    return {
        "id": 2,
        "applicationOwner": "llevame",
        "driver": "llevame-mzaragoza",
        "passenger": "llevame-quelopario",
        "start": {
            "address": {
                "street": "Sto domingo 1180",
                "location": {
                    "lat": -34.497956,
                    "lon": -58.534823
                }
            },
            "timestamp": 1509237426992
        },
        "end": {
            "address": {
                "street": "Maipu 1234",
                "location": {
                    "lat": -34.4978,
                    "lon": -58.497652
                }
            },
            "timestamp": 1509238026992
        },
        "totalTime": 600,
        "waitTime": 60,
        "travelTime": 540,
        "distance": 4300,
        "route": [
            {
                "location": {
                    "lat": -34.497999,
                    "lon": -58.534899
                },
                "timestamp": 1509238026692
            }
        ],
        "date": "2017-11-09T01:34:56.831Z"
    };
}

function mockPostTripReqBody() {
    return {
        "trip": {
            "driver": "llevame-mzaragoza",
            "passenger": "llevame-quelopario",
            "start": {
                "address": { "street": "Sto domingo 1180", "location": { "lat": -34.497956, "lon": -58.534823 } },
                "timestamp": 1509237426992
            },
            "end": {
                "address": {
                    "street": "Maipu 1234",
                    "location": {
                        "lat": -34.497800,
                        "lon": -58.497652
                    }
                },
                "timestamp": 1509238026992
            },
            "totalTime": 600,
            "waitTime": 60,
            "travelTime": 540,
            "distance": 4300,
            "route": [
                {
                    "location": {
                        "lat": 0,
                        "lon": 0
                    },
                    "timestamp": 1509238026692
                }
            ],
            "cost": {
                "currency": "ARS",
                "value": 350.25
            }
        },
        "paymethod": {
            "paymethod": "card",
            "parameters": {
                "expiration_month": "12", "expiration_year": "19", "number": "1111222233334444", "type": "visa", "ccvv": 123
            }
        }
    };
}

function mockTrips() {
    return [mockTrip_1(), mockTrip_2()];
}

function mockPassenger() {
    return {
        "id": "llevame-quelopario",
        "_ref": "6b868e317825e0ecbac97721009f91907eb7aa65",
        "applicationOwner": "llevame",
        "type": "passenger",
        "cars": [],
        "username": "quelopario",
        "name": "Hector",
        "surname": "Zaragoza",
        "country": "Argentina",
        "email": "quelopario@gmail.com",
        "birthdate": "1960-09-18T03:00:00.000Z",
        "images": [
            "https://www.postgresql.org/docs/9.6/static/datatype-json.html",
            "https://docs.google.com/document/d/1Ekd8ohj2WdSd5gg4_s4SGvP3P65CLb69U4-5fMBab4o/"
        ],
        "balance": [
            {
                "currency": "ARS",
                "value": 4885.5
            },
            {
                "currency": "EUR",
                "value": 45678.98
            }
        ]
    };
}

const dbRulesMock = [{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.pocketBalance.value < 0);}',
        consequence: 'function (R) {this.cannotTravel = true;R.stop();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.email.endsWith(\'@llevame.com\'));}',
        consequence: 'function (R) {this.free = true;R.stop();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\');}',
        consequence: 'function (R) {console.log(\'Costo minimo de viaje 50 pesos\');this.operations.push(v => 50);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\');}',
        consequence: 'function (R) {console.log(\'precio por km 15 pesos\');this.operations.push(v => v + this.mts * 0.015);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.dayOfWeek == 3 && this.hour == 15);}',
        consequence: 'function (R) {console.log(\'Descuento del 5% los miercoles de 15hs a 16hs\');this.operations.push(v => v * 0.95);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.dayOfWeek >= 1 && this.dayOfWeek <= 5 && this.hour >= 17 && this.hour < 19);}',
        consequence: 'function (R) {console.log(\'Recargo del 10% Lunes a Viernes de 17hs a 19hs\');this.operations.push(v => v * 1.1);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.todayTripCount >= 4);}',
        consequence: 'function (R) {console.log(\'Descuento del 5% a partir del 5 viaje del dia\');this.operations.push(v => v * 0.95);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.last30minsTripCount > 10);}',
        consequence: 'function (R) {console.log(\'Recargo del 15% si en los últimos 30 mins se realizaron mas de 10 viajes\');this.operations.push(v => v * 1.15);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'passenger\' && this.tripCount == 0);}',
        consequence: 'function (R) {console.log(\'Descuento de 100ARS en primer viaje\');this.operations.push(v => v - 100 > 0 ? v - 100 : 0);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'driver\');}',
        consequence: 'function (R) {console.log(\'Pago de viaje minimo 30ARS\');this.operations.push(v => 30);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'driver\');}',
        consequence: 'function (R) {console.log(\'Pago por KM de 5ARS\');this.operations.push(v => v + this.mts * 0.005);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'driver\' && this.dayOfWeek >= 1 && this.dayOfWeek <= 5 && this.hour >= 17 && this.hour < 19);}',
        consequence: 'function (R) {console.log(\'Aumento del 3% de Lunes a Viernes de 17hs a 19hs\');this.operations.push(v => v * 1.03);R.next();}',
        on: true
    }
},
{
    blob:
    {
        condition: 'function (R) {R.when(this.type == \'driver\' && this.todayTripCount > 10);}',
        consequence: 'function (R) {console.log(\'Aumento del 2% si realizo mas de 10 viajes en el dia\');this.operations.push(v => v * 1.02);R.next();}',
        on: true
    }
}];


function mockActiveRules() {
    return dbRulesMock;
}

function mockPayment() {
    return {
        "currency": "ARS",
        "paymentMethod": { "expiration_month": "12", "expiration_year": "19", "method": "card", "number": "1111222233334444", "type": "visa" },
        "transaction_id": "d01b5eaa-d0c8-4cb0-8158-ad4ac543d4ca",
        "value": 125.95000000000002
    };
}


function mockErr(msg = 'Error') {
    return new Error(msg);
}

describe('trips-controller', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getTrip', function () {
        it('Falla por un error en la BBDD', function () {
            const dbTrip = mockTrip_2();

            sandbox.stub(Trip, 'findById')
                .callsFake((tripId, callback) => callback(new Error('err')));

            const req = { serverId: dbTrip.applicationOwner, params: { tripId: dbTrip.id } };
            const res = mockErrRes(500);
            tripsController.getTrip(req, res);
        });

        it('Falla porque el viaje no existe', function () {
            const dbTrip = mockTrip_2();

            sandbox.stub(Trip, 'findById')
                .callsFake((tripId, callback) => callback());

            const req = { serverId: dbTrip.applicationOwner, params: { tripId: dbTrip.id } };
            const res = mockErrRes(404);
            tripsController.getTrip(req, res);
        });

        it('Obtiene el viaje para un usuario de negocio', function () {
            const dbTrip = mockTrip_2();

            sandbox.stub(Trip, 'findById')
                .callsFake((tripId, callback) => callback(null, dbTrip));

            const req = { params: { tripId: dbTrip.id } };
            const res = {
                send({ metadata, trip }) {
                    assert.ok(metadata.version);
                    assert.equal(dbTrip, trip);
                }
            };
            tripsController.getTrip(req, res);
        });

        it('Obtiene el viaje para una aplicacion', function () {
            const dbTrip = mockTrip_2();

            sandbox.stub(Trip, 'findById')
                .callsFake((tripId, callback) => callback(null, dbTrip));

            const req = { serverId: dbTrip.applicationOwner, params: { tripId: dbTrip.id } };
            const res = {
                send({ metadata, trip }) {
                    assert.ok(metadata.version);
                    assert.equal(dbTrip, trip);
                }
            };
            tripsController.getTrip(req, res);
        });

        it('Falla al obtener un viaje en el que no corresponden las aplicaciones', function () {
            const dbTrip = mockTrip_2();

            sandbox.stub(Trip, 'findById')
                .callsFake((tripId, callback) => callback(null, dbTrip));

            const req = { serverId: 'ANOTHER_APP', params: { tripId: dbTrip.id } };
            const res = mockErrRes(404);
            tripsController.getTrip(req, res);
        });
    });

    describe('#getTrips', function () {
        it('Falla por un error en la BBDD', function () {
            sandbox.stub(Trip, 'find')
                .callsFake(callback => callback(mockErr()));

            const req = {};
            const res = mockErrRes(500);
            tripsController.getTrips(req, res);
        });

        it('Obtiene los viajes correctamente', function () {
            const dbTrips = mockTrips();

            sandbox.stub(Trip, 'find')
                .callsFake(callback => callback(null, dbTrips));

            const req = {};
            const res = {
                send({ metadata, trips }) {
                    assert.equal(dbTrips.length, metadata.count);
                    assert.equal(dbTrips.length, metadata.total);
                }
            };
            tripsController.getTrips(req, res);
        });
    });

    describe('#postTrip', function () {
        it('Falla por un error en la bbdd', function () {
            const dbTrip = mockInsertedTrip();
            sandbox.stub(Trip, 'insert')
                .callsFake((trip, callback) => callback(mockErr()));

            const req = { body: mockPostTripReqBody(), serverId: dbTrip.applicationOwner };
            const res = mockErrRes(500);
            tripsController.postTrip(req, res);
        });

        it('Da de alta un viaje', function () {
            const dbTrip = mockInsertedTrip();
            sandbox.stub(Trip, 'insert')
                .callsFake((trip, callback) => callback(null, dbTrip));

            sandbox.stub(Trip, 'findByUser')
                .callsFake((user, callback) => callback(null, mockTrips()));

            const dbPassenger = mockPassenger();
            dbPassenger.getBalance = currency => dbPassenger.balance[0];
            sandbox.stub(ApplicationUser, 'findById')
                .callsFake((user, callback) => callback(null, dbPassenger));

            const dbRules = mockActiveRules();

            //console.log(dbRules);
            sandbox.stub(Rule, 'findActive')
                .callsFake(callback => callback(null, dbRules));

            sandbox.stub(paymentUtils, 'postPayment')
                .callsFake((paymentData, callback) => callback(null, mockPayment()));

            sandbox.stub(Transaction, 'insert')
                .callsFake((trans, callback) => callback(null, trans));

            sandbox.stub(ApplicationUser, 'pay')
                .callsFake((passenger, cost, callback) => callback());

            sandbox.stub(ApplicationUser, 'earn')
                .callsFake((passenger, cost, callback) => callback());

            const req = { body: mockPostTripReqBody(), serverId: dbTrip.applicationOwner };
            const res = {
                status(code) { this.code = code; },
                send({ metadata, trip, transaction }) {
                    
                }
            };
            tripsController.postTrip(req, res);
        });
    });
});
