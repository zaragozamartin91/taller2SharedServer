const moment = require('moment');

function validateEmail(email) {
    if (!email) return false;
    const re = /^(\w|\.)+@(\w+\.\w+)+$/;
    return re.test(email);
}

function validateDate(date, format = 'YYYY-MM-DD') {
    if (date) return moment(date, format).isValid();
    else return false;
}

exports.validateEmail = validateEmail;
exports.validateDate = validateDate;