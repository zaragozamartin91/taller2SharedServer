const ruleHandler = require('../utils/rule-handler');

const jsonRules = ruleHandler.toJson(ruleHandler.BASE_RULES);

jsonRules.forEach(jsonRule => {
    jsonRule.condition = jsonRule.condition.replace(/\r/g, '').replace(/\n */g, '');
    jsonRule.consequence = jsonRule.consequence.replace(/\r/g, '').replace(/\n */g, '');
});

console.log(jsonRules);

console.log(jsonRules.map(r => { return { blob: r }; }));