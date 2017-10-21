const RuleEngine = require('node-rules');
const moment = require('moment');

/* 
. Dont use closures into rule objects: There are things that an eval cannot bring back once a JS object is stringified. One of which is the outer environment 
which was bound to it. So if your condition or consequence are using any variables which are outside its function level scope, then those bindings wont be 
brought back when we load the stringified Rules back into the Rule engine from the store. If you dint understand this explanation or having troubles with this, 
you can raise an issue on the repo which we will help out. 
*/

//define the rules
const rules = [{
    'condition': function (R) {
        R.when(this.pocketBalance.value < 0);
    },
    'consequence': function (R) {
        this.cannotTravel = true;
        R.stop();
    }
}, {
    'condition': function (R) {
        R.when(this.email.endsWith('@llevame.com'));
    },
    'consequence': function (R) {
        this.free = true;
        R.stop();
    }
}, {
    'condition': function (R) {
        R.when(true);
    },
    'consequence': function (R) {
        this.operations.push(v => this.minCost);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(true);
    },
    'consequence': function (R) {
        this.operations.push(v => v + this.mts * 0.015);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(this.dayOfWeek == 3 && this.hour == 15);
    },
    'consequence': function (R) {
        this.operations.push(v => v * 0.95);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(this.dayOfWeek >= 1 && this.dayOfWeek <= 5 && this.hour >= 17 && this.hour < 19);
    },
    'consequence': function (R) {
        this.operations.push(v => v * 1.1);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(this.last30minsTripCount > 10);
    },
    'consequence': function (R) {
        this.operations.push(v => v * 1.15);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(this.todayTripCount >= 4);
    },
    'consequence': function (R) {
        this.operations.push(v => v * 0.95);
        R.next();
    }
}, {
    'condition': function (R) {
        R.when(this.tripCount == 0);
    },
    'consequence': function (R) {
        this.operations.push(v => v - 100 > 0 ? v - 100 : 0);
        R.next();
    }
}];

//sample fact to run the rules on	
const fact = {
    type: 'passenger',
    minCost: 50,
    mts: 5000,
    operations: [],
    dayOfWeek: moment().day(),
    hour: moment().hour(),
    tripCount: 1,
    last30minsTripCount: 31,
    email: 'mzaragoza@gmail.com',
    pocketBalance: { currency: 'peso', value: 100 },
    todayTripCount: 3
};

//initialize the rule engine
const ruleEngine = new RuleEngine(rules);

function checkResult(result) {
    if (result.cannotTravel) return console.log('NO PUEDE VIAJAR');
    if (result.free) return console.log('VIAJE GRATIS');

    let amount = result.transactionTotal;
    result.operations.forEach(op => amount = op(amount));
    console.log('Total: ' + amount);
}

new Promise(resolve => ruleEngine.execute(fact, resolve))
    .then(result => {
        checkResult(result);
        return Promise.resolve(ruleEngine.toJSON());
    }).then(store => {
        console.log('STORE:');
        console.log(store);

        /* De esta manera creamos un motor de reglas a partir de un json */
        const R1 = new RuleEngine();
        R1.fromJSON(store);

        return new Promise(resolve2 => R1.execute(fact, resolve2));
    }).then(result => {
        checkResult(result);
    });
