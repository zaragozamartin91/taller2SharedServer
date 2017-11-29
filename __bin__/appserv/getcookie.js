var http = require("http");

var options = {
    "method": "POST",
    "hostname": "192.168.99.100",
    "port": "5000",
    "path": "/login/username/mzaragoza/password/pepe",
    "headers": {
        "content-type": "application/json",
        "cache-control": "no-cache"
    }
};

var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        var body = Buffer.concat(chunks);
        //console.log(body.toString());
    });

    const cookieHeader = res.headers['set-cookie'];
    const cookie = cookieHeader[0].split(/;/)[0];
    console.log(cookie);
});

req.end();