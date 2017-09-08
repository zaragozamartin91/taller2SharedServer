const RuleEngine = require('node-rules');

/* 
. Dont use closures into rule objects: There are things that an eval cannot bring back once a JS object is stringified. One of which is the outer environment 
which was bound to it. So if your condition or consequence are using any variables which are outside its function level scope, then those bindings wont be 
brought back when we load the stringified Rules back into the Rule engine from the store. If you dint understand this explanation or having troubles with this, 
you can raise an issue on the repo which we will help out. 
*/

//define the rules
const rules = [{
    'condition': function (R) {
        R.when(this && (this.transactionTotal < 500));
    },
    'consequence': function (R) {
        this.amountOk = false;
        R.next();
    }
}];

//sample fact to run the rules on	
const fact = {
    'name': 'user4',
    'application': 'MOB2',
    'transactionTotal': 600,
    'cardType': 'Credit Card',
};

//initialize the rule engine
const ruleEngine = new RuleEngine(rules);
//Now pass the fact on to the rule engine for results
ruleEngine.execute(fact, function (result) {
    if (result.result) console.log('Payment Accepted');
    else console.log('Payment Rejected');
});

/* usando toJSON es posible exportar rules */
let store = ruleEngine.toJSON();
console.log(store);

/* de esta manera es posible agregar una rule. */
const newRule = {
    condition: `function(R) {
        R.when(this && this.name == 'user4');
    }`,
    consequence: `function (R) {
        this.result = false;
        R.stop();
    }`,
    on: true
};
store.push(newRule);

/* De esta manera creamos un motor de reglas a partir de un json */
const R1 = new RuleEngine();
R1.fromJSON(store);

//Now pass the fact on to the rule engine for results
R1.execute(fact, function (result) {
    if (result.result) console.log('Payment Accepted');
    else console.log('Payment Rejected');
});