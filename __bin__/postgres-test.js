const BusinessUser = require('../model/BusinessUser');
const dbManager = require('../model/db-manager');
const ApplicationServer = require('../model/ApplicationServer');
const Role = require('../model/Role');

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

function addRoles() {
    BusinessUser.addRoles('hector-70306', ['admin', 'manager', 'user'], (err, res) => {
        if (err) console.error(err);
        else console.log(res);
    });
}

BusinessUser.findByUsername('martin', (err, user) => {
    console.log('Antes de actualizar:');
    console.log(user);
    user.roles = ['admin', 'manager', 'user'];
    user.name = 'MARTIN';
    user.surname = 'ZARAGOZOOO';
    user.update((err, user) => {
        console.log('Luego de actualizar:');
        console.log(user);
        console.log('new ref:' + user._ref);
        dbManager.end();
    });
});
