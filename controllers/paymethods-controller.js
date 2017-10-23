const paymentUtils = require('../utils/payment-utils');

exports.getPaymethods = paymentUtils.getPaymethods;

exports.testPayment = function (req, res) {
    const paymentData = {
        'transaction_id': 'abc-def',
        'currency': 'ARS',
        'value': 250.25,
        'payMethod': {
            'paymethod': 'card',
            'parameters': {
                'ccvv': 123,
                'expiration_month': 12,
                'expiration_year': 19,
                'number': '1111222233334444',
                'type': 'visa'
            }
        }
    };
    paymentUtils.postPayment(req, res, paymentData);
};