'use strict';

var hammockRequest = require('../../../lib/hammock-request/');
var Router = require('../../../lib/http-hash-router/');

var mocks = require('../../../test/mocks/');
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

    var router = Router();

    router.set('/register', register);

    return {
        httpServer: handler,
        destroy: function noop() {}
    };

    function handler(req, res) {
        router(req, res, options, function noop() {});
    }
}
