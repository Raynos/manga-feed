'use strict';

var registerTests = require('./register.js');
var logoutTests = require('./logout.js');
var userTests = require('./user.js');

module.exports = function tests(allocServer, makeRequest) {
    logoutTests(allocServer, makeRequest);
    registerTests(allocServer, makeRequest);
    userTests(allocServer, makeRequest);
};
