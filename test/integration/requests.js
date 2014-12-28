'use strict';

var test = require('tape');

var makeRequest = require('../../lib/test-server-request/');
var quickCheck = require('../../lib/quick-check-request');

var Router = require('../../server/router.js');
var allocServer = require('./lib/alloc-server.js');

var serverSchema = Router().schema;

var userTests = require(
    '../../endpoints/user/test/requests/');
userTests(allocServer, makeRequest);

var healthTests = require(
    '../../endpoints/health/test/requests/health.js');
healthTests(allocServer, makeRequest);

quickCheck(test, allocServer, makeRequest, {
    route: '/register',
    method: 'POST',
    schema: serverSchema,
    map: function isValid(x) {
        x.body.confirmEmail = x.body.email;
        return x;
    },
    amount: 25
});

quickCheck(test, allocServer, makeRequest, {
    route: '/login',
    method: 'POST',
    schema: serverSchema,
    expect: {
        statusCode: 400,
        body: {
            type: 'endpoints.user.invalid-login-credentials'
        }
    },
    amount: 25
});

quickCheck(test, allocServer, makeRequest, {
    route: '/logout',
    method: 'POST',
    schema: serverSchema,
    amount: 1
});

quickCheck(test, allocServer, makeRequest, {
    route: '/health',
    method: 'GET',
    schema: serverSchema,
    amount: 1
});
