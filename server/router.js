'use strict';

var HttpHashRouter = require('../lib/http-hash-router/');
var httpMethods = require('http-methods/method');

var userEndpoint = require('../endpoints/user/');
var healthEndpoint = require('../endpoints/health/');

module.exports = createRouter;

function createRouter() {
    var router = HttpHashRouter();

    var httpSchema = SchemaTable();
    httpSchema.set('/register', userEndpoint['/register']);
    httpSchema.set('/health', healthEndpoint['/health']);

    router.set('/health',
        httpMethods(healthEndpoint['/health']));
    router.set('/register',
        httpMethods(userEndpoint['/register']));

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
            schemas[key] = {
                request: methods[key].requestSchema,
                response: methods[key].responseSchema
            };
        });
        table[route] = schemas;
    }
}
