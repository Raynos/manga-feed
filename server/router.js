'use strict';

var HttpHashRouter = require('../lib/http-hash-router/');
var process = require('process');

var userEndpoint = require('../endpoints/user/');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    router.set('/health', healthEndpoint);
    router.set('/register', userEndpoint['/register']);

    return router;
}

function healthEndpoint(req, res, opts, cb) {
    res.end('OK');
    process.nextTick(cb);
}
