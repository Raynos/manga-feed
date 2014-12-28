'use strict';

var test = require('tape');

var mocks = require('../../../test/mocks/');
var UserService = require('../index.js');

test('can create user service', function t(assert) {
    var userService = allocUserService();

    assert.equal(typeof userService.verify, 'function');
    assert.end();
});

test('can verify an existing user', function t(assert) {
    var userService = allocUserService();

    userService.create({
        email: 'bob@bob.com',
        password: 'foo'
    }, onCreate);

    function onCreate(err, createdUser) {
        assert.ifError(err);

        userService.verify({
            email: 'bob@bob.com',
            password: 'foo'
        }, onUser);

        function onUser(err, user) {
            assert.ifError(err);

            assert.equal(user.email, 'bob@bob.com');
            assert.equal(user.id, createdUser.id);
            assert.equal(user.hash, createdUser.hash);
            assert.equal(user.password, undefined);

            assert.end();
        }
    }
});

test('fails verify for non-existant user', function t(assert) {
    var userService = allocUserService();

    userService.verify({
        email: 'bob@bob.com',
        password: 'foo'
    }, onVerify);

    function onVerify(err, user) {
        assert.ok(err);

        assert.equal(user, undefined);
        assert.equal(err.type, 'services.user.non-existant-user');

        assert.end();
    }
});

test('fails verify for bad password', function t(assert) {
    var userService = allocUserService();

    userService.create({
        email: 'bob@bob.com',
        password: 'foo'
    }, onCreate);

    function onCreate(err) {
        assert.ifError(err);

        userService.verify({
            email: 'bob@bob.com',
            password: 'bar'
        }, onVerify);
    }

    function onVerify(err, user) {
        assert.ok(err);

        assert.equal(user, undefined);
        assert.equal(err.type, 'services.user.invalid-password');

        assert.end();
    }
});

function allocUserService(opts) {
    opts = opts || {};

    return UserService({
        level: opts.level || mocks.level()
    });
}
