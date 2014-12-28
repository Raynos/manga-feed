'use strict';

var test = require('tape');

module.exports = function tests(allocServer, makeRequest) {
    test('can register second user if logged out', function t(assert) {
        var server = allocServer();
        var jar = makeRequest.jar();

        makeRequest(server.httpServer, {
            url: '/register',
            method: 'POST',
            json: {
                email: 'foo@bar.com',
                confirmEmail: 'foo@bar.com',
                password: 'foobar123'
            },
            jar: jar
        }, onRegistered);

        function onRegistered(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server.httpServer, {
                url: '/register',
                method: 'POST',
                json: {
                    email: 'bar@bar.com',
                    confirmEmail: 'bar@bar.com',
                    password: 'foobar123'
                },
                jar: jar
            }, onSecondRegister);
        }

        function onSecondRegister(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 400);
            assert.equal(resp.body.type,
                'endpoints.user.register.already-logged-in');

            makeRequest(server.httpServer, {
                url: '/logout',
                method: 'POST',
                jar: jar
            }, onLogout);
        }

        function onLogout(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server.httpServer, {
                url: '/register',
                method: 'POST',
                json: {
                    email: 'bar@bar.com',
                    confirmEmail: 'bar@bar.com',
                    password: 'foobar123'
                },
                jar: jar
            }, onThirdRegister);
        }

        function onThirdRegister(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            server.destroy();
            assert.end();
        }
    });

    test('can register, logout & login', function t(assert) {
        var server = allocServer();
        var jar = makeRequest.jar();

        makeRequest(server.httpServer, {
            url: '/register',
            method: 'POST',
            json: {
                email: 'bob@bob.com',
                confirmEmail: 'bob@bob.com',
                password: 'foobar123'
            },
            jar: jar
        }, onRegistered);

        function onRegistered(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server.httpServer, {
                url: '/logout',
                method: 'POST',
                jar: jar
            }, onLogout);
        }

        function onLogout(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server.httpServer, {
                url: '/login',
                method: 'POST',
                json: {
                    email: 'bob@bob.com',
                    password: 'foobar123'
                },
                jar: jar
            }, onLogin);
        }

        function onLogin(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            server.destroy();
            assert.end();
        }
    });
};
