const moment = require('moment');
const ruleHandler = require('../utils/rule-handler');

//sample fact to run the rules on	
const fact = {
    type: 'passenger',
    mts: 5000,
    operations: [],
    dayOfWeek: moment().day(),
    hour: moment().hour(),
    tripCount: 1,
    last30minsTripCount: 11,
    email: 'mzaragoza@gmail.com',
    pocketBalance: { currency: 'ARS', value: 100 },
    todayTripCount: 11
};


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

ruleHandler.check(fact, ruleHandler.BASE_RULES).then(checkResult);

const jsonRules = ruleHandler.toJson(ruleHandler.BASE_RULES);
ruleHandler.checkFromJson(fact, jsonRules).then(checkResult);