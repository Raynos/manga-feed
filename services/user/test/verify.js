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
test('fails verify for non-existant user');
test('fails verify for bad password');
test('returns user record');

function allocUserService(opts) {
    opts = opts || {};

    return UserService({
        level: opts.level || mocks.level()
    });
}
