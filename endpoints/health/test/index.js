'use strict';

var hammockRequest = require('../../../lib/hammock-request');

var health = require('../index.js')['/health'].GET;

var healthTests = require('./requests/health.js');

healthTests(allocHealthServer, hammockRequest);

function allocHealthServer(opts) {
    var options = {};

    return {
        httpServer: handler,
        destroy: function noop() {}
    };

    function handler(req, res) {
        health(req, res, options);
    }
}
