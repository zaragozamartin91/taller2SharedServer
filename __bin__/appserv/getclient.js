var http = require("http");

var options = {
    "method": "GET",
    "hostname": "192.168.99.100",
    "port": "5000",
    "path": "/api/v1/client/llevame-khaleesi",
    "headers": {
        "cookie": "session=eyJ1c2VybmFtZSI6Im16YXJhZ296YSJ9.DP-4_g.kjxq1vE9C3M16_78ntFiYAWlDf0",
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