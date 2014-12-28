'use strict';

var assert = require('assert');
var HttpHashRouter = require('../lib/http-hash-router/');
var httpMethods = require('http-methods/method');

var userEndpoint = require('../endpoints/user/');
var healthEndpoint = require('../endpoints/health/');
var appRoutes = require('../app/routes/');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    var httpSchema = SchemaTable();
    httpSchema.set('/health', healthEndpoint['/health']);
    httpSchema.set('/register', userEndpoint['/register']);
    httpSchema.set('/logout', userEndpoint['/logout']);
    httpSchema.set('/login', userEndpoint['/login']);

    router.set('/health',
        httpMethods(healthEndpoint['/health']));
    router.set('/register',
        httpMethods(userEndpoint['/register']));
    router.set('/logout',
        httpMethods(userEndpoint['/logout']));
    router.set('/login',
        httpMethods(userEndpoint['/login']));

    router.set('/',
        httpMethods(appRoutes['/']));
    router.set('/app/js/:id',
        httpMethods(appRoutes['/app/js/:id']));

    return {
        handler: router,
        schema: httpSchema
    };
}

function SchemaTable() {
    var table = {};

    table.set = set;

    return table;

    function set(route, methods) {
        var schemas = {};
        Object.keys(methods).forEach(function addSchema(key) {
            var h = methods[key];

            assert(h.requestSchema, 'requestSchema required');
            assert(h.responseSchema, 'responseSchema required');

            schemas[key] = {
                request: h.requestSchema,
                response: h.responseSchema
            };
        });
        table[route] = schemas;
    }
}
