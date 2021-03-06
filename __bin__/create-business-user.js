const http = require('http');

const HOST = process.env.HOST || 'localhost';
const token = process.env.TOKEN;

const options = {
    'method': 'POST',
    'hostname': HOST,
    'port': '5000',
    'path': '/api/v1/business-users/?token=' + token,
    'headers': {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'postman-token': 'f57c9856-660a-1e63-e583-97158e227be8'
    }
};

const req = http.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
    });
});

req.write(JSON.stringify({
    username: 'mzaragoza',
    password: 'pepe',
    name: 'Martin',
    surname: 'Zaragoza',
    roles: ['admin']
}));
req.end();