'use strict';

var makeRequest = require(
    '../../lib/test-server-request/');
var allocServer = require('./lib/alloc-server.js');

var registerTests = require(
    '../../endpoints/user/test/requests/register.js');
registerTests(allocServer, makeRequest);
