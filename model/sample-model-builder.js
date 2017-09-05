const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const ApplicationServer = require('./ApplicationServer');
const Role = require('./Role');
const flow = require('nimble');

flow.series([
    callback => {
        console.log('Creando tabla de usuarios');
        BusinessUser.createTable(callback);
    },
    callback => {
        console.log('Creando tabla de roles');
        Role.createTable(callback);
    },
    callback => {
        console.log('Creando tabla de roles de usuario');
        BusinessUser.createRolesTable(callback);
    },
    callback => {
        console.log('Creando tabla de servers');
        ApplicationServer.createTable(callback);
    },
    callback => {
        console.log('Insertando usuario');
        BusinessUser.insert({ username: 'martin', password: 'pepe' }, callback);
    },
    callback => {
        console.log('Insertando usuario');
        BusinessUser.insert({ username: 'mateo', password: 'posting' }, callback);
    },
    callback => {
        console.log('Insertando usuario');
        BusinessUser.insert({ username: 'hector', password: 'rules' }, callback);
    },
    callback => {
        console.log('Insertando rol');
        Role.insert('manager', callback);
    },
    callback => {
        console.log('Insertando rol');
        Role.insert('admin', callback);
    },
    callback => {
        console.log('Insertando rol');
        Role.insert('user', callback);
    },
    callback => {
        console.log('Agregando rol a usuario');
        BusinessUser.findByUsername('martin', (err, user) => {
            user.addRole('admin', callback);
        });
    },
    callback => {
        console.log('Agregando rol a usuario');
        BusinessUser.findByUsername('martin', (err, user) => {
            user.addRole('manager', callback);
        });
    },
    callback => {
        console.log('Agregando rol a usuario');
        BusinessUser.findByUsername('mateo', (err, user) => {
            user.addRole('user', callback);
        });
    },
    callback => {
        console.log('Agregando app server');
        BusinessUser.findByUsername('martin', (err, user) => {
            ApplicationServer.insert({ name: 'oneApp', createdBy: user.id }, callback);
        });
    },
    callback => {
        console.log('Fin');
        dbManager.end();
    }
]);