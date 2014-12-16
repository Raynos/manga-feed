'use strict';

var mocks = require('../../../test/mocks/');
var hammockRequest = require('../../../lib/hammock-request/');
var register = require('../register.js');

var registerTests = require('./requests/register.js');

registerTests(allocRegisterServer, hammockRequest);

function allocRegisterServer(opts) {
    opts = opts || {};
    var clients = {
        session: opts.session || mocks.session(),
        level: opts.level || mocks.level()
    };
    var options = {
        clients: clients,
        services: {
            user: opts.user || mocks.user(clients)
        }
    };

    handler.close = function noopClose() {};

    return handler;

    function handler(req, res) {
        register(req, res, options);
    }
}
