'use strict';

var HttpHashRouter = require('../lib/http-hash-router/');
var httpMethods = require('http-methods/method');

var userEndpoint = require('../endpoints/user/');
var healthEndpoint = require('../endpoints/health/');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    var httpSchema = {
        '/register': {
            'POST': {
                request: userEndpoint['/register'].POST
                    .requestSchema,
                response: userEndpoint['/register'].POST
                    .responseSchema
            }
        },
        '/health': {
            'GET': {
                request: healthEndpoint['/health'].GET
                    .requestSchema,
                response: healthEndpoint['/health'].GET
                    .responseSchema
            }
        }
    };

    router.set('/health',
        httpMethods(healthEndpoint['/health']));
    router.set('/register',
        httpMethods(userEndpoint['/register']));

    return {
        handler: router,
        schema: httpSchema
    };
}
