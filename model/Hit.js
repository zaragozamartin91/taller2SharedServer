const dbManager = require('./db-manager');

function Hit(id, server, url, date) {
    this.id = id;
    this.server = server;
    this.url = url;
    this.date = date;
}

const table = 'hits';
Hit.table = table;

function fromObj(hitObj) {
    if (!hitObj) return null;
    const { id, server, url, date } = hitObj;
    return new Hit(id, server, url, date);
}

Hit.insert = function (hitObj, callback) {
    const { server, url } = hitObj;
    const sql = `INSERT INTO ${table}(server, url) VALUES($1,$2) RETURNING *`;
    const values = [server, url];
    
    dbManager.queryPromise(sql, values)
        .then(([dbHit]) => callback(null, fromObj(dbHit)))
        .catch(callback);
};

module.exports = Hit;