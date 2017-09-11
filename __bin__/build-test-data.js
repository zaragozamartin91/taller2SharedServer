const http = require('http');

const options = {
    'method': 'POST',
    'hostname': 'localhost',
    'port': '5000',
    'path': '/api/v1/test-data',
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

req.end();