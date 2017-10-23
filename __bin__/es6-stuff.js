
const trip = { cost: { } };
const { cost: { currency = 'ARS' } = { currency:'ARS' } } = trip;

console.log(currency);