const http = require("http");

new Promise((resolve, reject) => {
    const options = {
        "method": "POST",
        "hostname": "192.168.99.100",
        "port": "5000",
        "path": "/login/username/mzaragoza/password/pepe",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    };

    const req = http.request(options, function (res) {
        const chunks = [];
        const cookieHeader = res.headers['set-cookie'];
        const cookie = cookieHeader[0].split(/;/)[0];
        console.log(cookie);

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            const body = Buffer.concat(chunks);
            console.log(body);
            resolve({ cookie, body });
        });
    });

    req.end();
});



