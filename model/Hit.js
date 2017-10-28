const dbManager = require('./db-manager');

function Hit(id, server, method, url, date) {
    this.id = id;
    this.server = server;
    this.method = method;
    this.url = url;
    this.date = date;
}

const table = 'hits';
Hit.table = table;

function fromObj(hitObj) {
    if (!hitObj) return null;
    const { id, server, method, url, date } = hitObj;
    return new Hit(id, server, method, url, date);
}

Hit.insert = function (hitObj, callback) {
    const { server, method, url } = hitObj;
    const sql = `INSERT INTO ${table}(server, method, url) VALUES($1,$2,$3) RETURNING *`;
    const values = [server, method, url];

    dbManager.queryPromise(sql, values)
        .then(([dbHit]) => callback(null, fromObj(dbHit)))
        .catch(callback);
};

module.exports = Hit;