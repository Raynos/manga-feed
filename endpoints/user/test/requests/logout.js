'use strict';

var test = require('tape');
var HammockRequest = require('hammock/request');
var HammockResponse = require('hammock/response');

module.exports = function tests(allocServer, makeRequest) {
    test('can logout', function t(assert) {
        var server = allocServer();
        var jar = makeRequest.jar();

        makeRequest(server.httpServer,  {
            url: '/logout',
            method: 'POST',
            json: true,
            jar: jar
        }, function onResponse(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body, 'ok');

            var cookieHeader = resp.headers['set-cookie'];
            var cookie = String(cookieHeader).split(';')[0];
            var sess = server.clients.session(
                HammockRequest({
                    headers: {
                        'cookie': cookie
                    }
                }),
                HammockResponse()
            );

            sess.set('user', {
                id: 'fake-user'
            }, function onSet(err) {
                assert.ifError(err);

                makeRequest(server.httpServer, {
                    url: '/logout',
                    method: 'POST',
                    json: true,
                    jar: jar
                }, onResponse2);
            });

            function onResponse2(err, resp) {
                assert.ifError(err);

                assert.equal(resp.statusCode, 200);
                assert.equal(resp.body, 'ok');

                sess.get('user', function onUser(err, user) {
                    assert.ifError(err);

                    assert.equal(user, undefined);

                    server.destroy();
                    assert.end();
                });
            }
        });
    });
};
