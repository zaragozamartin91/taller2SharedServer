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
        // regla de viajes largos
        R.when(this && (this.distance > 5000));
    },
    'consequence': function (R) {
        this.operations.push(a => a * 1.1);
        console.log(this.amount);
        R.next();
    }
}, {
    'condition': function (R) {
        // regla de jubilados
        R.when(this && (this.age > 60));
    },
    'consequence': function (R) {
        this.operations.push(a => a * 0.8);
        console.log(this.amount);
        R.next();
    }
}, {
    'condition': function (R) {
        // regla de tarjetas
        R.when(this && (this.card == 'visa'));
    },
    'consequence': function (R) {
        this.operations.push(a => a * 0.9);
        console.log(this.amount);
        R.next();
    }
}];

const distance = 4000;
const amount = distance * 0.05;
const card = 'master';
const age = 50;
const operations = [];

//sample fact to run the rules on	
const fact = { amount, distance, card, age, operations };

//initialize the rule engine
const ruleEngine = new RuleEngine(rules);
//Now pass the fact on to the rule engine for results
ruleEngine.execute(fact, function (result) {
    let finalAmount = result.amount;
    result.operations.forEach(operation => {
        finalAmount = operation(finalAmount);
    });
    console.log(finalAmount);
});

