'use strict';

var test = require('tape');

module.exports = function tests(allocServer, makeRequest) {
    test('can register', function t(assert) {
        var server = allocServer();

        makeRequest(server, {
            url: '/register',
            json: {
                email: 'foo@bar.com',
                confirmEmail: 'foo@bar.com',
                password: 'foobar123'
            }
        }, function onResponse(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body.email, 'foo@bar.com');

            server.close();
            assert.end();
        });
    });

    test('errors if register when logged in', function t(assert) {
        var server = allocServer();
        var jar = makeRequest.jar();

        makeRequest(server, {
            url: '/register',
            json: {
                email: 'foo@bar.com',
                confirmEmail: 'foo@bar.com',
                password: 'foobar123'
            },
            jar: jar
        }, function onResponse(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);

            makeRequest(server, {
                url: '/register',
                json: {
                    email: 'foo@bar.com',
                    confirmEmail: 'foo@bar.com',
                    password: 'foobar123'
                },
                jar: jar
            }, function onResponse2(err, resp) {
                assert.ifError(err);

                assert.equal(resp.statusCode, 400);
                assert.equal(resp.body.type,
                    'user-register.already-logged-in');

                server.close();
                assert.end();
            });
        });
    });
};