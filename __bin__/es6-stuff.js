const p1 = Promise.resolve('pepe');
const p2 = Promise.resolve('posting');

// cause.request.res.statusCode
Promise.all([p1, p2]).then( ([s1,s2]) => console.log(s1,s2));


const moment = require('moment');
const m = moment('2017-01-01').add(1,'hour').toDate().getTime();

console.log(m);
