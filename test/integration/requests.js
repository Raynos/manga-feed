'use strict';

var test = require('tape');

var makeRequest = require('../../lib/test-server-request/');
var quickCheck = require('../../lib/quick-check-request');

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

var healthTests = require(
    '../../endpoints/health/test/requests/health.js');
healthTests(allocServer, makeRequest);

quickCheck(test, allocServer, makeRequest, {
    route: '/health',
    method: 'GET'
});
