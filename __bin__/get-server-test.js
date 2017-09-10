var http = require('http');

var options = {
    'method': 'GET',
    'hostname': '192.168.99.100',
    'port': '5000',
    'path': '/api/v1/servers/omegaserver-76672?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1hcnRpbi0xMjk1MyIsInVzZXJuYW1lIjoibWFydGluIiwiaWF0IjoxNTA1MDg1ODQ5LCJleHAiOjE1MDU3MzM4NDl9.ilGfO1ym-vQcSPBaikOH-thgt2edM2rHo_rCfaDcGv0',
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
        console.log(body.toString());
    });
});

req.end();