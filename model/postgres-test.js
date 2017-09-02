const mc = require('./model-config');
const pg = require('pg');

let dbUrl = `postgres://${mc.user}:${mc.password}@${mc.host}:${mc.port}/${mc.db}`;
console.log(`db url: ${dbUrl}`);

const connectionString = process.env.DATABASE_URL || dbUrl;

const client = new pg.Client(connectionString);
client.connect();

client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message); // Hello World!
    client.end();
});

const BusinessUser = require('./BusinessUser');
const dbManager = require('./db-manager');

function createUserTable() {
    BusinessUser.createTable(err => {
        if (err) console.error(err);
        else console.log('business_user table created!');
        dbManager.end();
    });
}

function insert() {
    BusinessUser.insert({ username: 'martin', password: 'pepe' }, (err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

function find() {
    BusinessUser.find((err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

function findByUsername() {
    BusinessUser.findByUsername('martin', (err,usr) => {
        if (err) console.error(err);
        else console.log(usr);
        dbManager.end();
    });
}

findByUsername();