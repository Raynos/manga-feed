'use strict';

var jsf = require('json-schema-faker');
var parallel = require('run-parallel');
var util = require('util');
var process = require('process');

module.exports = quickCheck;

function quickCheck(test, allocServer, makeRequest, opts) {
    var name = 'running 100 requests against ' + opts.method +
        ' ' + opts.route;

    test(name, function t(assert) {
        var server = allocServer();

        server.once('listening', listening);

        function listening() {
            var schemaTable = server.httpSchema;
            var schemas = schemaTable[opts.route][opts.method];

            var treqs = getNRequestObjs(100, schemas.request);

            parallel(treqs.map(runRequest), onFinished);
        }

        function runRequest(treq) {
            return function makeReq(cb) {
                makeRequest(server, {
                    json: treq.body,
                    url: opts.route,
                    agentOptions: {
                        maxSockets: 100
                    },
                    method: opts.method
                }, cb);
            };
        }

        function onFinished(err, responses) {
            assert.ifError(err);

            var allGood = true;

            responses.forEach(function checkTres(tres) {
                if (tres.statusCode !== 200) {
                    allGood = false;
                    assert.equal(tres.statusCode, 200,
                        'unexpected statusCode ' +
                        tres.statusCode);

                    process.stderr.write('# body' +
                        util.format(tres.body) + '\n');
                }
            });

            assert.ok(allGood, 'some requests failed');

            server.close();
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
