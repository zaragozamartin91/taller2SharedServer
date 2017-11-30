var http = require("http");

var options = {
    "method": "GET",
    "hostname": "192.168.99.100",
    "port": "5000",
    "path": "/api/v1/client/llevame-khaleesi",
    "headers": {
        "cookie": "session=eyJ1c2VybmFtZSI6Im16YXJhZ296YSJ9.DQEE3Q.cJpxlyaBe7X5RzDvZOkL1f0AUHU",
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
        console.log(body.toString());
    });
});

req.end();