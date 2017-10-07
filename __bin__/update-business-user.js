const http = require('http');

const HOST = process.env.HOST || 'localhost';
const token = process.env.TOKEN;
const userId = 'martin';

const options = {
    'method': 'PUT',
    'hostname': HOST,
    'port': '5000',
    'path': '/api/v1/business-users/' + userId + '?token=' + token,
    'headers': {
        'content-type': 'application/json',
        'cache-control': 'no-cache'
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
    _ref:'883bc664f425882ac4d81f68a71d90b1a6627b27',
    username: 'mzaragoza',
    password: 'pepe',
    name: 'Martin',
    surname: 'ZARAGOZA',
    roles: ['admin','MANAGER','uSer']
}));
req.end();