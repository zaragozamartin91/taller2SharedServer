const hash = require('object-hash');

exports.hash = function (obj) {
    return hash(obj);
};

exports.verify = function (h, obj) {
    return h.valueOf() == hash(obj).valueOf();
};