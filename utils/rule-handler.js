const RuleEngine = require('node-rules');

/**
 * Clona un fact para que dos rules no afecten las propieades de un mismo fact.
 * @param {any} fact 
 */
function cloneFact(fact) {
    return JSON.parse(JSON.stringify(fact));
}

function buildFact(baseFact = {}) {
    const fact = cloneFact(baseFact);
    const { operations = [], mts = 0, type = '',
        pocketBalance = { currency: 'ARS', value: 0 }, email = '', initialValue = 0 } = fact;
    fact.operations = operations;
    fact.mts = mts;
    fact.type = type;
    fact.pocketBalance = pocketBalance;
    fact.email = email;
    fact.initialValue = initialValue;
    return fact;
}

exports.check = function (fact, rules) {
    fact = buildFact(fact);
    const ruleEngine = new RuleEngine(rules);
    return new Promise((resolve, reject) => {
        try {
            ruleEngine.execute(fact, resolve);
        } catch (error) {
            reject(error);
        }
    });
};

exports.checkFromJson = function (fact, jsonRules) {
    fact = buildFact(fact);
    const ruleEngine = new RuleEngine();
    ruleEngine.fromJSON(jsonRules);
    return new Promise((resolve, reject) => {
        try {
            ruleEngine.execute(fact, resolve);
        } catch (error) {
            reject(error);
        }
    });
};

exports.toJson = function (rules) {
    const ruleEngine = new RuleEngine(rules);
    return ruleEngine.toJSON();
};

//define the rules
const BASE_RULES = [ /* Reglas del pasajero ---------------------------------------------------------------------------------------------------- */
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


exports.BASE_RULES = BASE_RULES;