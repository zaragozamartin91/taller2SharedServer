exports.generateId = function(prefix) {
    return `${prefix}-${Math.floor(Math.random() * 100000).toString()}`;
};