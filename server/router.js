'use strict';

var HttpHashRouter = require('../lib/http-hash-router/');
var process = require('process');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    router.set('/health', healthEndpoint);

    return router;
}

function healthEndpoint(req, res, opts, cb) {
    res.end('OK');
    process.nextTick(cb);
}
