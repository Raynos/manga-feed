'use strict';

var test = require('tape');
var makeRequest = require('../../lib/test-server-request/');

var allocServer = require('./lib/alloc-server.js');

test('responds to 404', function t(assert) {
    var server = allocServer();

    makeRequest(server, {
        url: '/404'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 404);
        assert.equal(resp.body, 'Resource Not Found');

        server.close();
        assert.end();
    });
});
