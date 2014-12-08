'use strict';

var test = require('tape');

var makeRequest = require('./lib/request.js');
var createServer = require('../server.js');

test('can create a server', function t(assert) {
    createServer({}, function onServer(err, service) {
        assert.ifError(err);

        assert.ok(service.httpServer);
        assert.end();
    });
});

test('can call health', function t(assert) {
    var destroy = makeRequest(createServer, {
        url: '/health'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 200);
        assert.equal(resp.body, 'OK');

        destroy();
        assert.end();
    });
});

test('responds to 404', function t(assert) {
    var destroy = makeRequest(createServer, {
        url: '/404'
    }, function onResponse(err, resp) {
        assert.ifError(err);

        assert.equal(resp.statusCode, 404);
        assert.equal(resp.body, 'Resource Not Found');

        destroy();
        assert.end();
    });
});
