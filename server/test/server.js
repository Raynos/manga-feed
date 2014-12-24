'use strict';

var test = require('tape');

var createServer = require('../server.js');

test('can create a server', function t(assert) {
    var server = createServer({});

    assert.ok(server.httpServer);
    assert.end();
});
