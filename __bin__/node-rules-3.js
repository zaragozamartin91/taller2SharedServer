const RuleEngine = require('node-rules');
const moment = require('moment');

/* 
. Dont use closures into rule objects: There are things that an eval cannot bring back once a JS object is stringified. One of which is the outer environment 
which was bound to it. So if your condition or consequence are using any variables which are outside its function level scope, then those bindings wont be 
brought back when we load the stringified Rules back into the Rule engine from the store. If you dint understand this explanation or having troubles with this, 
you can raise an issue on the repo which we will help out. 
*/

//define the rules
const rules = [ /* Reglas del pasajero ---------------------------------------------------------------------------------------------------- */
    { /* No puede viajar con saldo negativo */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.pocketBalance.value < 0);
        },
        'consequence': function (R) {
            this.cannotTravel = true;
            R.stop();
        }
    }, { /* aje gratis si usuario tiene un mail con dominio @llevame.com */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.email.endsWith('@llevame.com'));
        },
        'consequence': function (R) {
            this.free = true;
            R.stop();
        }
    }, { /* Costo minimo de viaje 50 pesos */
        'condition': function (R) {
            R.when(this.type == 'passenger');
        },
        'consequence': function (R) {
            console.log('Costo minimo de viaje 50 pesos');
            this.operations.push(v => 50);
            R.next();
        },
    }, { /* precio por km 15 pesos */
        'condition': function (R) {
            R.when(this.type == 'passenger');
        },
        'consequence': function (R) {
            console.log('precio por km 15 pesos');
            this.operations.push(v => v + this.mts * 0.015);
            R.next();
        },
        priority: 2
    }, { /* Descuento del 5% los miercoles de 15hs a 16hs */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.dayOfWeek == 3 && this.hour == 15);
        },
        'consequence': function (R) {
            console.log('Descuento del 5% los miercoles de 15hs a 16hs');
            this.operations.push(v => v * 0.95);
            R.next();
        }
    }, { /* Recargo del 10% Lunes a Viernes de 17hs a 19hs */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.dayOfWeek >= 1 && this.dayOfWeek <= 5 && this.hour >= 17 && this.hour < 19);
        },
        'consequence': function (R) {
            console.log('Recargo del 10% Lunes a Viernes de 17hs a 19hs');
            this.operations.push(v => v * 1.1);
            R.next();
        }
    }, { /* Descuento del 5% a partir del 5 viaje del dia */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.todayTripCount >= 4);
        },
        'consequence': function (R) {
            console.log('Descuento del 5% a partir del 5 viaje del dia');
            this.operations.push(v => v * 0.95);
            R.next();
        }
    }, { /* Recargo del 15% si en los últimos 30 mins se realizaron mas de 10 viajes */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.last30minsTripCount > 10);
        },
        'consequence': function (R) {
            console.log('Recargo del 15% si en los últimos 30 mins se realizaron mas de 10 viajes');
            this.operations.push(v => v * 1.15);
            R.next();
        },
    }, { /* Descuento de 100ARS en primer viaje */
        'condition': function (R) {
            R.when(this.type == 'passenger' && this.tripCount == 0);
        },
        'consequence': function (R) {
            console.log('Descuento de 100ARS en primer viaje');
            this.operations.push(v => v - 100 > 0 ? v - 100 : 0);
            R.next();
        },
    }, /* Reglas del conductor ---------------------------------------------------------------------------------------------------- */
    { /* Pago de viaje minimo 30ARS */
        'condition': function (R) {
            R.when(this.type == 'driver');
        },
        'consequence': function (R) {
            console.log('Pago de viaje minimo 30ARS');
            this.operations.push(v => 30);
            R.next();
        }
    }, { /* Pago por KM de 5ARS */
        'condition': function (R) {
            R.when(this.type == 'driver');
        },
        'consequence': function (R) {
            console.log('Pago por KM de 5ARS');
            this.operations.push(v => v + this.mts * 0.005);
            R.next();
        }
    }, { /* Aumento del 3% de Lunes a Viernes de 17hs a 19hs */
        'condition': function (R) {
            R.when(this.type == 'driver' && this.dayOfWeek >= 1 && this.dayOfWeek <= 5 && this.hour >= 17 && this.hour < 19);
        },
        'consequence': function (R) {
            console.log('Aumento del 3% de Lunes a Viernes de 17hs a 19hs');
            this.operations.push(v => v * 1.03);
            R.next();
        }
    }, { /* Aumento del 2% si realizo mas de 10 viajes en el dia */
        'condition': function (R) {
            R.when(this.type == 'driver' && this.todayTripCount > 10);
        },
        'consequence': function (R) {
            console.log('Aumento del 2% si realizo mas de 10 viajes en el dia');
            this.operations.push(v => v * 1.02);
            R.next();
        }
    }];

//sample fact to run the rules on	
const fact = {
    type: 'driver',
    mts: 5000,
    operations: [],
    dayOfWeek: moment().day(),
    hour: moment().hour(),
    tripCount: 1,
    last30minsTripCount: 11,
    email: 'mzaragoza@gmail.com',
    pocketBalance: { currency: 'peso', value: 100 },
    todayTripCount: 11
};

//initialize the rule engine
const ruleEngine = new RuleEngine(rules);

function checkResult(result) {
    if (result.cannotTravel) return console.log('NO PUEDE VIAJAR');
    if (result.free) return console.log('VIAJE GRATIS');

    let amount = 0;
    result.operations.forEach(op => {
        amount = op(amount);
        console.log('amount: ' + amount);
    });
    console.log('Total: ' + amount);
}

new Promise(resolve => ruleEngine.execute(fact, resolve))
    .then(result => {
        checkResult(result);
        return Promise.resolve(ruleEngine.toJSON());
    }).then(store => {
        /* De esta manera creamos un motor de reglas a partir de un json */
        const R1 = new RuleEngine();
        R1.fromJSON(store);

        return new Promise(resolve2 => R1.execute(fact, resolve2));
    }).then(result => {
        checkResult(result);
    });
