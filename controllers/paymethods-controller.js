const paymentUtils = require('../utils/payment-utils');

exports.getPaymethods = paymentUtils.getPaymethods;

exports.testPayment = function (req, res) {
    const paymentData = { 
        'transaction_id': 'abc-def',
        'currency': 'ARS',
        'value': 250.25,
        'paymentMethod':
        { 
            'expiration_month': '12',
            'expiration_year': '19',
            'method': 'card',
            'type': 'visa',
            'number': '1111222233334444' 
        }
    };
    paymentUtils.postPayment(req, res, paymentData);
};