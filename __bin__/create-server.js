const http = require('http');

const HOST = process.env.HOST || 'localhost';
const token = process.env.TOKEN;

const options = {
    'method': 'POST',
    'hostname': HOST,
    'port': '5000',
    'path': '/api/v1/servers?token=' + token,
    'headers': {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
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

req.write(JSON.stringify({ name: 'super server', createdBy: 'martin-99841' }));
req.end();