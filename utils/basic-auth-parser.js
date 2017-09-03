function parse(req) {
    const authorization = req.headers.authorization;
    if (authorization) {
        const parts = authorization.split(' ');
        const auth = new Buffer(parts[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];

        return { user, pass };
    } else return {};
}

exports.parse = parse;