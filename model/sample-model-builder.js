const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const ApplicationServer = require('./ApplicationServer');
const Role = require('./Role');



function buildAll() {
    BusinessUser.createTable(err => {
        console.error(err);
        console.log('Tabla de usuarios creada');

        Role.createTable(err => {
            console.error(err);
            console.log('Tabla de roles creada');

            Role.insert('user', err => console.error(err));
            Role.insert('manager', err => console.error(err));
            Role.insert('admin', err => console.error(err));

            BusinessUser.createRolesTable(err => {
                console.error(err);
                console.log('Tabla de usuarios-roles creada');

                const userObj = { username: 'martin', password: 'pepe' };
                BusinessUser.insert(userObj, (err, user) => {
                    console.error(err);
                    console.log(user);

                    ApplicationServer.createTable(err => {
                        console.error(err);

                        const servObj = { name: 'oneApp', createdBy: user.id };
                        ApplicationServer.insert(servObj, (err, server) => {
                            console.error(err);
                            console.log(server);
                            dbManager.end();
                        });
                    });
                });
            });
        });
    });
}

buildAll();