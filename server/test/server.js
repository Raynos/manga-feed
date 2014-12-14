'use strict';

var test = require('tape');

var makeRequest = require('../../lib/test-server-request/');
var allocServer = require('./lib/alloc-server.js');
var createServer = require('../server.js');

test('can create a server', function t(assert) {
    createServer({}, function onServer(err, service) {
        assert.ifError(err);

        assert.ok(service.httpServer);
        assert.end();
    });
});

test('can call health', function t(assert) {
    makeRequest(allocServer, {
        url: '/health'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'OK');

        assert.end();
    });
});

test('responds to 404', function t(assert) {
    makeRequest(allocServer, {
        url: '/404'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 404);
        assert.equal(resp.body, 'Resource Not Found');

        assert.end();
    });
});
