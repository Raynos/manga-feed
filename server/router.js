'use strict';

var HttpHashRouter = require('../lib/http-hash-router/');
var process = require('process');
var httpMethods = require('http-methods/method');

var userEndpoint = require('../endpoints/user/');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    router.serverSchema = {
        '/register': {
            'POST': {
                request: userEndpoint['/register'].POST
                    .requestSchema,
                response: userEndpoint['/register'].POST
                    .responseSchema
            }
        }
    };

    router.set('/health', healthEndpoint);
    router.set('/register',
        httpMethods(userEndpoint['/register']));

    return router;
}

function healthEndpoint(req, res, opts, cb) {
    res.end('OK');
    process.nextTick(cb);
}
