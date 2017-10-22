const moment = require('moment');
const dbManager = require('../model/db-manager');
const ruleHandler = require('../utils/rule-handler');

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

dbManager.queryPromise('SELECT blob from rules',[])
    .then(blobs => {
        console.log('blobs:');
        console.log(blobs);

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

        const jsonRules = blobs.map(blob => blob.blob);

        ruleHandler.checkFromJson(fact, jsonRules).then(checkResult);
    });