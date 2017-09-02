const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const BusinessUser = require('../model/BusinessUser');
const conf = require('../config/main-config');

const user = BusinessUser.mockUsers[0];
const username = user.username;

// if user is found and password is right
// create a token
let token = jwt.sign({username}, conf.tokenSecret,{
    expiresIn: "15m"
});

console.log('signed token:');
console.log(token);

jwt.verify(token, conf.tokenSecret, (err,decoded) => {
    if(err) return console.error(err);
    console.log('decoded:');
    console.log(decoded);
});
