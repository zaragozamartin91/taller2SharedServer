const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');
const tableManager = require('../model/table-manager');
const moment = require('moment');
const ApplicationUser = require('../model/ApplicationUser');
const Car = require('../model/Car');

function createUserTable() {
    BusinessUser.createTable(err => {
        if (err) console.error(err);
        else console.log('business_user table created!');
        dbManager.end();
    });
}

function insertBusinessUser() {
    BusinessUser.insert({ username: 'mateo', password: 'pepe' }, (err, res) => {
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
        name: 'oneApp',
        createdBy: 'martin-9375'
    }, (err, res) => {
        if (err) console.error(err);
        else console.log(res);
        dbManager.end();
    });
}

function findApplicationServer() {
    ApplicationServer.find((err, res) => {
        console.log(res);
        dbManager.end();
    });
}

function addRole() {
    BusinessUser.findByUsername('martin', (err, user) => {
        user.addRole('admin', (err, res) => {
            if (err) return console.error(err);
            console.log(res);
            dbManager.end();
        });
    });
}

let value = [{
    currency: 'pesos',
    value: 12.50
}, {
    currency: 'dolares',
    value: 65478.12
}, {
    currency: 'euros',
    value: 987.0
}];
// dbManager.query('INSERT INTO jsons(data) VALUES($1)', [JSON.stringify(value)], (err, res) => {
//     console.error(err);
//     console.log(res);
//     dbManager.end();
// });

let [applicationOwner, username, name, surname, country, email, birthdate, type, images, balance] = [
    'oneApp-63140',
    'quelopario',
    'hector',
    'zaragoza',
    'argentina',
    'quelopario@accusys',
    moment('1995-12-25').toDate(),
    'driver',
    ['https://www.postgresql.org/docs/9.6/static/datatype-json.html'],
    [{ currency: 'peso', value: 123.45 }, { currency: 'dolar', value: 6789.10 }]
];
let userObj = { applicationOwner, username, name, surname, country, email, birthdate, type, images, balance };

// ApplicationUser.insert(userObj, (err, res) => {
//     console.error(err);
//     console.log(res);
//     dbManager.end();
// });


// let [owner, properties] = ['mzaragoza-58646', [{ name: 'model', value: 'renault' }, { name: 'year', value: 2001 }]];
// Car.insert({ owner, properties }, (err, res) => {
//     console.error(err);
//     console.log(res);
//     dbManager.end();
// });

// Car.findByOwner('mzaragoza-58646', (err, cars) => {
//     console.error(err);
//     console.log(cars);
//     console.log(cars[0].properties[1]);
//     dbManager.end();
// });


dbManager.queryPromise('SELECT * FROM points', [])
    .then(rows => {
        console.log(rows[0].value.address.location.lat, rows[0].value.address.location.lon);
        dbManager.end();
    }).catch(cause => {
        console.error(cause);
        dbManager.end();
    });
