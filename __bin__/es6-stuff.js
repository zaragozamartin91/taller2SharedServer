const rulesController = require('../controllers/rules-controller');

const facts = [
    {blob: 'nombre: martin'},
    {blob: 'trabajo  : "programador"'},
    {blob: ' edad  : 12345'},
];

const fact = rulesController.buildFact(facts);

console.log(JSON.parse(fact));