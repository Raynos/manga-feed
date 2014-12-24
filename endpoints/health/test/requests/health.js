'use strict';

var test = require('tape');

module.exports = function tests(allocServer, makeRequest) {
    test('can request health', function t(assert) {
        var server = allocServer();

        makeRequest(server.httpServer, {
            url: '/health',
            json: true
        }, function onResponse(err, resp) {
            assert.ifError(err);

            assert.equal(resp.statusCode, 200);
            assert.equal(resp.body, 'ok');

            server.destroy();
            assert.end();
        });
    });
};
