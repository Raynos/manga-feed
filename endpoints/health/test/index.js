'use strict';

var hammockRequest = require('../../../lib/hammock-request');

var mocks = require('../../../test/mocks');
var health = require('../index.js')['/health'].GET;

var healthTests = require('./requests/health.js');

healthTests(allocHealthServer, hammockRequest);

function allocHealthServer() {
    return mocks.server({
        clients: {},
        services: {},
        handler: health
    });
}
