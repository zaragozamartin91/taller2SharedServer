const BusinessUser = require('./BusinessUser');
const dbManager = require('./db-manager');
const ApplicationServer = require('./ApplicationServer');

function createUserTable() {
    BusinessUser.createTable(err => {
        if (err) console.error(err);
        else console.log('business_user table created!');
        dbManager.end();
    });
}

function insertBusinessUser() {
    BusinessUser.insert({ username: 'martin', password: 'pepe' }, (err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

function findBusinessUser() {
    BusinessUser.find((err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

function findBusinessUserByUsername() {
    BusinessUser.findByUsername('martin', (err, usr) => {
        if (err) console.error(err);
        else console.log(usr);
        dbManager.end();
    });
}

function createAppServerTable() {
    ApplicationServer.createTable(err => {
        console.error(err);
        dbManager.end();
    });
}

function insertAppServer() {
    ApplicationServer.insert({
        name: 'anotherApp',
        createdBy: 'roberto-54080'
    }, (err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

insertBusinessUser();

//dbManager.query('SELECT * FROM magic', [], (err, res) => {
//    console.log(res.rows[0]);
//    dbManager.end();
//});