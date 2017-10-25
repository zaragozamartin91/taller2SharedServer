function buildPaymentData(transactionId, currency, value, { parameters, paymethod }) {
    const { expiration_month, expiration_year, number, type } = parameters;
    return {
        'transaction_id': transactionId,
        currency,
        value,
        'paymentMethod':
        {
            expiration_month,
            expiration_year,
            'method': paymethod,
            type,
            number
        }
    };
}

const obj = {
    'parameters': {
        'ccvv': 'number',
        'expiration_month': 'number',
        'expiration_year': 'number',
        'number': 'string',
        'type': 'string'
    },
    'paymethod': 'card'
};

const payment = buildPayment('abc-def', 'ARS', 250.26, obj);

console.log(payment);