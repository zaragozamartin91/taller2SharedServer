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

    afterEach(function () {
    });
});


