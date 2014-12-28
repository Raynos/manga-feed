'use strict';

var test = require('tape');

var MockUser = {
    email: 'bob@bob.com',
    password: 'foobar123'
};

module.exports = function tests(allocServer, makeRequest) {
    test('can login as a user', function t(assert) {
        var server = allocServer();

        var userService = server.services.user;

        userService.create(MockUser, onUser);

        function onUser(err, domainUser) {
            assert.ifError(err);

            makeRequest(server.httpServer, {
                url: '/login',
                method: 'POST',
                json: MockUser
            }, onLogin);

            function onLogin(err, resp) {
                assert.ifError(err);

                assert.equal(resp.statusCode, 200);

                assert.equal(resp.body.email, 'bob@bob.com');
                assert.equal(resp.body.id, domainUser.id);
                assert.equal(resp.body.hash, domainUser.hash);

                server.destroy();
                assert.end();
            }
        }
    });

    test('cannot login twice', function t(assert) {
        var server = allocServer();

        var jar = makeRequest.jar();
        var userService = server.services.user;

        userService.create(MockUser, onUser);

        function onUser(err, domainUser) {
            assert.ifError(err);

            makeRequest(server.httpServer, {
                url: '/login',
                method: 'POST',
                json: MockUser,
                jar: jar
            }, onLogin);
        }

        function onLogin(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server.httpServer, {
                url: '/login',
                method: 'POST',
                json: MockUser,
                jar: jar
            }, onLoginAgain);
        }

        function onLoginAgain(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 400);
            assert.equal(resp.body.type,
                'endpoints.user.already-logged-in');

            server.destroy();
            assert.end();
        }
    });

    test('fails with bad password', function t(assert) {
        var server = allocServer();

        var userService = server.services.user;

        userService.create(MockUser, onUser);

        function onUser(err) {
            assert.ifError(err);

            makeRequest(server.httpServer, {
                url: '/login',
                method: 'POST',
                json: {
                    email: 'bob@bob.com',
                    password: 'foobar1234'
                }
            }, onLogin);
        }

        function onLogin(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 400);
            assert.equal(resp.body.type,
                'endpoints.user.invalid-login-credentials');

            server.destroy();
            assert.end();
        }
    });

    test('fails with non-existant user', function t(assert) {
        var server = allocServer();

        makeRequest(server.httpServer, {
            url: '/login',
            method: 'POST',
            json: {
                email: 'bob@bob.com',
                password: 'foobar123'
            }
        }, onLogin);

        function onLogin(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 400);
            assert.equal(resp.body.type,
                'endpoints.user.invalid-login-credentials');

            server.destroy();
            assert.end();
        }
    });
};
