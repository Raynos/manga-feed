'use strict';

var jsf = require('json-schema-faker');
var parallel = require('run-parallel');

module.exports = quickCheck;

function quickCheck(test, allocServer, makeRequest, opts) {
    var reqs = opts.amount || 100;
    var name = 'running ' + reqs + ' requests against ' +
        opts.method + ' ' + opts.route;

    test(name, function t(assert) {
        var server = allocServer();
        var httpServer = server;

        if (typeof server.listen !== 'function' &&
            server.httpServer &&
            typeof server.httpServer.listen === 'function'
        ) {
            httpServer = server.httpServer;
        }

        httpServer.once('listening', listening);

        function listening() {
            var schemas = opts.schema[opts.route][opts.method];

            var treqs = getNRequestObjs(reqs, schemas.request);

            parallel(treqs.map(runRequest), onFinished);
        }

        function runRequest(treq) {
            return function makeReq(cb) {
                makeRequest(httpServer, {
                    json: treq.body,
                    url: opts.route,
                    agentOptions: {
                        maxSockets: reqs
                    },
                    method: opts.method
                }, cb);
            };
        }

        function onFinished(err, responses) {
            assert.ifError(err);

            var allGood = true;

            var expect = opts.expect || {};
            var expectedStatus = expect.statusCode || 200;
            var expectedBody = expect.body || {};

            responses.forEach(function checkTres(tres) {
                var isValid = tres.statusCode === expectedStatus;
                Object.keys(expectedBody)
                    .forEach(function k(key) {
                        isValid = isValid &&
                            tres.body[key] === expectedBody[key];
                    });

                if (!isValid) {
                    allGood = false;
                    assert.equal(tres.statusCode, expectedStatus,
                        'unexpected statusCode ' +
                        tres.statusCode);

                    Object.keys(expectedBody)
                        .forEach(function k(key) {
                            assert.equal(tres.body[key],
                                expectedBody[key],
                                'unexpected `body.' + key +
                                '` ' + tres.body[key]);
                        });

                    console.error('body', tres.body);
                }
            });

            assert.ok(allGood, 'some requests failed');

            if (typeof server.destroy === 'function') {
                server.destroy();
            } else if (typeof server.close === 'function') {
                server.close();
            }
            assert.end();
        }
    });

    function getNRequestObjs(n, requestSchema) {
        var results = [];

        while (results.length < n) {
            var obj = jsf(requestSchema);
            if (opts.map) {
                obj = opts.map(obj);
            }
            results.push(obj);
        }

        return results;
    }
}
