'use strict';

var test = require('tape');
var makeRequest = require(
    '../../lib/test-server-request/');
var allocServer = require('./lib/alloc-server.js');

var registerTests = require(
    '../../endpoints/user/test/requests/register.js');
registerTests(allocServer, makeRequest);

quickCheck(test, allocServer, makeRequest, {
    route: '/register',
    method: 'POST',
    map: function isValid(x) {
        x.body.confirmEmail = x.body.email;
        return x;
    }
});

function quickCheck(test, allocServer, makeRequest, opts) {
    var jsf = require('json-schema-faker');
    var parallel = require('run-parallel');
    var util = require('util');
    var process = require('process');

    var name = 'running 100 requests against ' + opts.method +
        ' ' + opts.route;

    test(name, function t(assert) {
        var server = allocServer();

        server.once('listening', listening);

        function listening() {
            var schemaTable = server.serverSchema;
            var schemas = schemaTable[opts.route][opts.method];
            var treqs = getNRequestObjs(100, schemas.request);

            parallel(treqs.map(runRequest), onFinished);
        }

        function runRequest(treq) {
            return function makeReq(cb) {
                makeRequest(server, {
                    json: treq.body,
                    url: opts.route,
                    method: opts.method
                }, onResponse);

                function onResponse(err, tres) {
                    if (err) {
                        return cb(err);
                    }

                    assert.equal(tres.statusCode, 200,
                        'unexpected statusCode ' +
                        tres.statusCode);

                    if (tres.statusCode !== 200) {
                        process.stdout.write('# body' +
                            util.format(tres.body) + '\n');
                    }
                    cb();
                }
            };
        }

        function onFinished(err) {
            assert.ifError(err);

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
