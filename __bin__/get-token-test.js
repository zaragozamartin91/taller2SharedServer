var http = require('http');

var options = {
    'method': 'POST',
    'hostname': '192.168.99.100',
    'port': '5000',
    'path': '/api/v1/token',
    'headers': {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
    }
};

var req = http.request(options, function (res) {
    var chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        var body = Buffer.concat(chunks);
        console.log('Respuesta:');
        console.log(body.toString());
    });
});

req.end(JSON.stringify({ username: 'martin', password: 'pepe' }));