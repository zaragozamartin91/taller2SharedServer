const assert = require('assert');
const dataValidator = require('../utils/data-validator');

describe('data-validator', function () {
    beforeEach(function () {
    });

    describe('#validateEmail()', function () {
        it('Valida una direccion de correo', function () {
            assert.ok(dataValidator.validateEmail('mzaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m.zaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m_zaragoza@gmail.com'));
            assert.ok(dataValidator.validateEmail('m_zaragoza.23@gmail.com'));
            assert.ok(!dataValidator.validateEmail(null));
        });
    });

    describe('#validateDate()', function () {
        it('Valida una fecha', function () {
            assert.ok(dataValidator.validateDate('1991-03-21'));
            assert.ok(dataValidator.validateDate('21-03-1991', 'DD-MM-YYYY'));
            assert.ok(!dataValidator.validateDate(''));
        });
    });

    describe('#validateTransaction', function () {
        it('Rechaza una transaccion sin id', function () {
            const transReq = {};
            const validation = dataValidator.validateTransaction(transReq);
            assert.ok(!validation.valid);
        });

        it('Rechaza una transaccion sin metodo de pago', function () {
            const transReq = { transaction: '1234' };
            const validation = dataValidator.validateTransaction(transReq);
            assert.ok(!validation.valid);
        });

        it('Acepta una transaccion', function () {
            const transReq = { transaction: '1234', paymethod: {} };
            const validation = dataValidator.validateTransaction(transReq);
            assert.ok(validation.valid);
        });
    });

    describe('#validateTrip', function () {
        it('Falla porque el conductor es invalido', function () {
            const tripObj = { driver: 1234 };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque el pasajero es invalido', function () {
            const tripObj = { driver: 'pepe', passenger: 1234 };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque no hay punto de inicio', function () {
            const tripObj = { driver: 'pepe', passenger: 'reg' };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque no hay punto de final', function () {
            const tripObj = { driver: 'pepe', passenger: 'reg', start: {} };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque tiempo de espera invalido', function () {
            const tripObj = { driver: 'pepe', passenger: 'reg', start: {}, end: {} };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque tiempo de viaje invalido', function () {
            const tripObj = { driver: 'pepe', passenger: 'reg', start: {}, end: {}, waitTime: 1234 };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });

        it('Falla porque distancia es invalida', function () {
            const tripObj = { driver: 'pepe', passenger: 'reg', start: {}, end: {}, waitTime: 1234, travelTime: 1234 };
            const validation = dataValidator.validateTrip(tripObj);
            assert.ok(!validation.valid);
        });
    });

    afterEach(function () {
    });
});


