'use strict';

var typedRequestHandler = require(
    '../../lib/typed-request-handler/');
var V = require('../../lib/schema-ast/');

module.exports = {
    '/health': {
        'GET': typedRequestHandler(health, {
            name: 'Health',
            requestSchema: V.http.Request({
                method: 'GET'
            }),
            responseSchema: V.http.Response({
                statusCode: 200,
                body: V.string('ok')
            })
        })
    }
};

function health(treq, opts, cb) {
    cb(null, {
        statusCode: 200,
        body: 'ok'
    });
}
