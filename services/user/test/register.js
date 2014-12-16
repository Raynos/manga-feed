'use strict';

var test = require('tape');

var mocks = require('../../../test/mocks');
var UserService = require('../index.js');

test('can create user service', function t(assert) {
    var userService = allocUserService();

    assert.equal(typeof userService.register, 'function');
    assert.end();
});

test('can register a user', function t(assert) {
    var level = mocks.level();
    var userService = allocUserService({
        level: level
    });

    userService.register({
        email: 'bob@bob.com',
        password: 'hello'
    }, function onUser(err, user) {
        assert.ifError(err);

        assert.ok(user.id);
        assert.ok(user.hash);
        assert.equal(user.email, 'bob@bob.com');
        assert.equal(user.password, null);

        var k = '!users!' + user.id;
        level.get(k, function onUser(err, user2) {
            assert.ifError(err);

            assert.equal(user2.id, user.id);
            assert.equal(user2.email, user.email);

            assert.end();
        });
    });
});

test('cannot create same user twice', function t(assert) {
    var userService = allocUserService();

    userService.register({
        email: 'bob@bob.com',
        password: 'foo'
    }, function onUser(err, user) {
        assert.ifError(err);

        assert.ok(user.id);

        userService.register({
            email: 'bob@bob.com',
            password: 'foo'
        }, function onUser(err, user) {
            assert.ok(err);
            assert.equal(err.type, 'services.user.duplicate-email');

            assert.equal(user, undefined);

            assert.end();
        });
    });
});

function allocUserService(opts) {
    opts = opts || {};

    return UserService({
        level: opts.level || mocks.level()
    });
}
