const assert = require('assert');
const sinon = require('sinon');
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

const paymethodsMock = {
    "items": [
        {
            "parameters": {
                "ccvv": "number",
                "expiration_month": "number",
                "expiration_year": "number",
                "number": "string",
                "type": "string"
            },
            "paymethod": "card"
        },
        {
            "parameters": {
                "type": "string"
            },
            "paymethod": "cash"
        }
    ]
};

const paymentDataMock = {
    transaction_id: 'llevame-quelopario-4300-1510087455327',
    currency: 'ARS',
    value: 125.95000000000002,
    paymentMethod:
        {
            expiration_month: '12',
            expiration_year: '19',
            method: 'card',
            type: 'visa',
            number: '1111222233334444',
            ccvv: 123
        }
};

function mockCardPayment() {
    return {
        "transaction_id": "d01b5eaa-d0c8-4cb0-8158-ad4ac543d4ca",
        "currency": "ARS",
        "value": 125.95000000000002,
        "paymentMethod": { "expiration_month": "12", "expiration_year": "19", "method": "card", "number": "1111222233334444", "type": "visa" },
    };
}

describe('payment-utils-test', function () {
    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        paymentUtils.updateToken(null);
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('#getPaymethods', function () {
        it('Obtiene los medios de pago correctamente', function () {
            //const token = contents.data.access_token;
            const token = '12345';
            const tokenRes = { data: { access_token: token } };
            sandbox.stub(paymentUtils, 'getTokenPromise').returns(Promise.resolve(tokenRes));

            const paymethodsRes = { data: paymethodsMock };
            sandbox.stub(paymentUtils, 'paymethodsPromise').returns(Promise.resolve(paymethodsRes));

            const req = {};
            const res = {
                send({ metadata, paymethods }) {
                    assert.equal(paymethodsMock.items.length, metadata.count);
                    assert.equal(paymethodsMock.items.length, metadata.total);

                    const names = paymethods.map(pm => pm.name);
                    const expectedNames = paymethodsMock.items.map(item => item.paymethod);
                    assert.equal(JSON.stringify(expectedNames), JSON.stringify(names));

                    const parameters = paymethods.map(pm => pm.parameters);
                    const expectedParams = paymethodsMock.items.map(item => item.parameters);
                    assert.equal(JSON.stringify(expectedParams), JSON.stringify(expectedParams));
                }
            };
            paymentUtils.getPaymethods(req, res);
        });

        it('Falla porque no puede renovar el token', function () {
            //const token = contents.data.access_token;
            const errObj = { request: { res: { statusCode: 500 } } };
            sandbox.stub(paymentUtils, 'getTokenPromise').returns(Promise.reject(errObj));


            const req = {};
            const res = mockErrRes(500);
            paymentUtils.getPaymethods(req, res);
        });

        it('Falla porque se alcanzo la cantidad maxima de intentos de renovacion de token', function () {
            //const token = contents.data.access_token;
            const errObj = { request: { res: { statusCode: 401 } } };
            sandbox.stub(paymentUtils, 'getTokenPromise').returns(Promise.reject(errObj));

            const req = {};
            const res = mockErrRes(500);
            paymentUtils.getPaymethods(req, res);
        });

        it('Falla porque no se esta autorizado, luego renueva el token y falla por un error en la conexion', function () {
            //const token = contents.data.access_token;
            const errObj = { request: { res: { statusCode: 403 } } };
            sandbox.stub(paymentUtils, 'getTokenPromise')
                .onFirstCall().returns(Promise.reject({ request: { res: { statusCode: 403 } } }))
                .onSecondCall().returns(Promise.reject({ request: { res: { statusCode: 500 } } }));

            const req = {};
            const res = mockErrRes(500);
            paymentUtils.getPaymethods(req, res);
        });
    });


    describe('#postPayment', function () {
        it('Realiza un pago exitosamente', function () {
            const token = '12345';
            const tokenRes = { data: { access_token: token } };
            sandbox.stub(paymentUtils, 'getTokenPromise').returns(Promise.resolve(tokenRes));

            const paymentRes = { data: mockCardPayment() };
            sandbox.stub(paymentUtils, 'paymentPromise').returns(Promise.resolve(paymentRes));

            paymentUtils.postPayment(paymentDataMock, (err, payment) => {
                assert.ok(!err);
                console.log(payment);
                console.log();
                console.log(paymentDataMock);
            });
        });

        it('Falla porque se alcanzo la cantidad maxima de intentos de renovacion de token', function () {
            //const token = contents.data.access_token;
            const errObj = { request: { res: { statusCode: 401 } } };
            sandbox.stub(paymentUtils, 'getTokenPromise').returns(Promise.reject(errObj));

            paymentUtils.postPayment(paymentDataMock, err => {
                assert.ok(err);
            });
        });
    });
});