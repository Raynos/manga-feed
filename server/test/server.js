'use strict';

var test = require('tape');

var createServer = require('../server.js');

test('can create a server', function t(assert) {
    createServer({}, function onServer(err, service) {
        assert.ifError(err);

        assert.ok(service.httpServer);
        assert.end();
    });
});
