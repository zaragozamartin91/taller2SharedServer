const mc = require('./modelConfig');
const pg = require('pg');

let dbUrl = `postgres://${mc.user}:${mc.password}@${mc.host}:${mc.port}/${mc.db}`;
console.log(`db url: ${dbUrl}`);

const connectionString = process.env.DATABASE_URL || dbUrl;

//'postgres://root:root@192.168.99.100:5432/root';

const client = new pg.Client(connectionString);
client.connect();

//const query = client.query(
//    'CREATE TABLE person(id INT PRIMARY KEY NOT NULL, name VARCHAR(40) not null)');
//query.on('end', () => { client.end(); });

client.query('SELECT $1::text as message', ['Hello world!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message) // Hello World!
    client.end()
  });
