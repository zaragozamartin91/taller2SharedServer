const assert = require('assert');
const Role = require('../model/Role');

describe('Role', function () {
    beforeEach(function () {
    });

    describe('#asStrings()', function () {
        it('convierte un conjunto de roles en strings', function () {
            const roles = [Role.manager(), Role.admin(), Role.user()];
            const strings = Role.asStrings(roles);
            assert.ok(strings[0] == 'manager');
            assert.ok(strings[1] == 'admin');
            assert.ok(strings[2] == 'user');
        });

        it('obtiene un arreglo vacio si no se pasan roles', function () {
            const strings = Role.asStrings(undefined);
            assert.ok(strings.length == 0);
        });
    });

    describe('#diff()', function () {
        it('obtiene la diferencia de roles', function () {
            const roles1 = [Role.manager().type, Role.user()];
            const roles2 = [Role.manager(), Role.admin()];
            const diff = Role.diff(roles1, roles2);
            assert.ok(diff.keep.indexOf('manager') >= 0);
            assert.ok(diff.remove.indexOf('user') >= 0);
            assert.ok(diff.add.indexOf('admin') >= 0);
        });

        it('todos los roles deben eliminarse', function () {
            const roles1 = [Role.manager().type, Role.user()];
            const roles2 = [];
            const diff = Role.diff(roles1, roles2);
            assert.ok(diff.keep.length == 0);
            assert.ok(diff.remove.indexOf('user') >= 0);
            assert.ok(diff.add.length == 0);
        });
    });

    describe('#fromStrings()', function () {
        it('crea roles a partir de strings', function () {
            const strings = ['admin', 'manager', 'user'];
            const roles = Role.fromStrings(strings);
            assert.ok(roles[0].isAdmin());
            assert.ok(roles[1].isManager());
            assert.ok(roles[2].isUser());
            assert.ok(roles[0].isValid());
            assert.ok(roles[1].isValid());
            assert.ok(roles[2].isValid());
        });
    });

    describe('#filterValid()', function () {
        it('a partir de un arreglo filtra los roles validos', function () {
            let strings = ['admin', 'manager', 'user'];
            let valid = Role.filterValid(strings);
            assert.ok(valid[0].isAdmin());
            assert.ok(valid[1].isManager());
            assert.ok(valid[2].isUser());
            assert.ok(valid.length == 3);

            strings = ['admin', 'asdasdasd', 'user'];
            valid = Role.filterValid(strings);
            assert.ok(valid[0].isAdmin());
            assert.ok(valid[1].isUser());
            assert.ok(valid.length == 2);
        });
    });

    afterEach(function () {
    });
});


