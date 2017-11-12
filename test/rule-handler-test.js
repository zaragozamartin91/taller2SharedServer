const assert = require('assert');
const sinon = require('sinon');
const ruleHandler = require('../utils/rule-handler');
const moment = require('moment');

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

function handleResult(results) {
    let amount = 0;
    results.operations.forEach(op => amount = op(amount));
    return amount;
}

describe('rule-handler', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#check', function () {
        it('Chequea reglas de pasajero', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = { type, mts: distance, operations: [], dayOfWeek: moment().day(), hour: moment().hour() };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Pasajero no puede viajar por tener balance negativo', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [],
                dayOfWeek: moment().day(), hour: moment().hour(), pocketBalance: { value: -10 }
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES)
                .then(results => assert.ok(results.cannotTravel));
        });

        it('Pasajero viaja gratis por tener email llevame', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [],
                dayOfWeek: moment().day(), hour: moment().hour(), email: 'asd@llevame.com'
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES)
                .then(results => assert.ok(results.free));
        });

        it('Descuento del 5% los miercoles de 15hs a 16hs', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [],
                dayOfWeek: moment('2017-11-08 15:30').day(), hour: moment('2017-11-08 15:30').hour()
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Recargo del 10% Lunes a Viernes de 17hs a 19hs', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [],
                dayOfWeek: moment('2017-11-09').day(), hour: moment('2017-11-09 17:30').hour()
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Descuento del 5% a partir del 5 viaje del dia', function () {
            const type = 'passenger';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [], todayTripCount: 4,
                dayOfWeek: moment('2017-11-09').day(), hour: moment('2017-11-09 17:30').hour()
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Chequea reglas de chofer', function () {
            const type = 'driver';
            const distance = 1500;
            const fact = { type, mts: distance, operations: [], dayOfWeek: moment().day(), hour: moment().hour() };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Aumento del 3% de Lunes a Viernes de 17hs a 19hs', function () {
            const type = 'driver';
            const distance = 1500;
            const fact = { type, mts: distance, operations: [], dayOfWeek: moment('2017-11-09').day(), hour: moment('2017-11-09 17:30').hour() };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });

        it('Aumento del 2% si realizo mas de 10 viajes en el dia', function () {
            const type = 'driver';
            const distance = 1500;
            const fact = {
                type, mts: distance, operations: [], dayOfWeek: moment().day(), hour: moment().hour(),
                todayTripCount: 11
            };
            ruleHandler.check(fact, ruleHandler.BASE_RULES).then(handleResult);
        });
    });
});