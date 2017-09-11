const http = require('http');

const HOST = process.env.HOST || 'localhost';
const token = process.env.TOKEN;
const serverId = 'superserver-15235';

const options = {
    'method': 'POST',
    'hostname': HOST,
    'port': '5000',
    'path': '/api/v1/servers/' + serverId + '?token=' + token,
    'headers': {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'postman-token': 'a4319d03-3253-65f5-70be-618e93b9c595'
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

req.write(JSON.stringify({ name: 'super server', createdBy: 'martin-14033' }));
req.end();