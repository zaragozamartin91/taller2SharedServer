const dbManager = require('./db-manager');
const BusinessUser = require('./BusinessUser');
const ApplicationServer = require('./ApplicationServer');
const Role = require('./Role');



function buildAll() {
    BusinessUser.createTable(err => {
        if (err) return console.error(err);

        Role.createTable(err => {
            if (err) return console.error(err);

            Role.createRoles(err => {
                if (err) return console.error(err);

                BusinessUser.createRolesTable(err => {
                    if (err) return console.error(err);

                    const userObj = { username: 'martin', password: 'pepe' };
                    BusinessUser.insert(userObj, (err, user) => {
                        if (err) return console.error(err);
                        console.log(user);

                        ApplicationServer.createTable(err => {
                            if (err) return console.error(err);

                            const servObj = { name: 'oneApp', createdBy: user.id };
                            ApplicationServer.insert(servObj, (err, server) => {
                                if (err) return console.error(err);
                                else console.log(server);
                                dbManager.end();
                            });
                        });
                    });
                });
            });
        });
    });
}

buildAll();